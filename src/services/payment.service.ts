import { Injectable, signal, inject } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { environment } from '../environments/environment';
import { CartItem } from '../app/models/cart-item.model';
import { SupabaseService } from './supabase.service';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  breakdown: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private supabase = inject(SupabaseService);
  
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;
  
  private _isLoaded = signal(false);
  private _loadError = signal<string | null>(null);
  private _isProcessing = signal(false);
  
  readonly isLoaded = this._isLoaded.asReadonly();
  readonly loadError = this._loadError.asReadonly();
  readonly isProcessing = this._isProcessing.asReadonly();

  constructor() {
    this.initializeStripe();
  }

  private async initializeStripe(): Promise<void> {
    try {
      // Skip if no publishable key configured
      if (!environment.stripe.publishableKey || 
          environment.stripe.publishableKey === 'YOUR_STRIPE_PUBLISHABLE_KEY') {
        this._loadError.set('Stripe publishable key not configured');
        return;
      }

      this.stripe = await loadStripe(environment.stripe.publishableKey);
      
      if (this.stripe) {
        this._isLoaded.set(true);
        console.log('Stripe loaded successfully');
      } else {
        this._loadError.set('Failed to load Stripe');
      }
    } catch (error) {
      this._loadError.set(error instanceof Error ? error.message : 'Unknown error loading Stripe');
    }
  }

  /**
   * Get the Stripe instance for direct API access.
   */
  getStripe(): Stripe | null {
    return this.stripe;
  }

  /**
   * Get the current Stripe Elements instance.
   */
  getElements(): StripeElements | null {
    return this.elements;
  }

  /**
   * Create a PaymentIntent by calling the Supabase Edge Function.
   * Returns clientSecret needed to confirm the payment.
   */
  async createPaymentIntent(
    items: CartItem[],
    customerEmail: string,
    shippingCost: number = 0,
    promoCode?: string
  ): Promise<{ data: PaymentIntent | null; error: string | null }> {
    try {
      const response = await fetch(
        `${environment.supabase.url}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${environment.supabase.anonKey}`,
          },
          body: JSON.stringify({
            items: items.map(item => ({
              id: item.id,
              quantity: item.quantity,
              selectedColor: item.selectedColor,
              selectedSize: item.selectedSize,
            })),
            customerEmail,
            shippingCost,
            promoCode,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return { data: null, error: result.error || 'Payment initialization failed' };
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Create payment intent error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  /**
   * Initialize Stripe Elements with the Payment Element.
   * Call this after creating a PaymentIntent.
   */
  async initializeElements(
    clientSecret: string,
    containerId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe) {
      return { success: false, error: 'Stripe not loaded' };
    }

    try {
      // Create Elements instance
      this.elements = this.stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#111827',
            colorBackground: '#ffffff',
            colorText: '#111827',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            borderRadius: '8px',
            spacingUnit: '4px',
          },
          rules: {
            '.Input': {
              border: '1px solid #d1d5db',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              padding: '12px',
            },
            '.Input:focus': {
              border: '1px solid #111827',
              boxShadow: '0 0 0 1px #111827',
            },
            '.Label': {
              fontWeight: '500',
              fontSize: '14px',
              marginBottom: '8px',
            },
          },
        },
      });

      // Create and mount Payment Element
      this.paymentElement = this.elements.create('payment', {
        layout: 'tabs',
      });

      const container = document.getElementById(containerId);
      if (!container) {
        return { success: false, error: `Container #${containerId} not found` };
      }

      this.paymentElement.mount(container);

      return { success: true };
    } catch (error) {
      console.error('Initialize elements error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize payment form' 
      };
    }
  }

  /**
   * Confirm the payment using Stripe Elements.
   */
  async confirmPayment(returnUrl: string): Promise<PaymentResult> {
    if (!this.stripe || !this.elements) {
      return { success: false, error: 'Payment not initialized' };
    }

    this._isProcessing.set(true);

    try {
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      });

      if (error) {
        return { 
          success: false, 
          error: error.message || 'Payment failed' 
        };
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        return { 
          success: true, 
          paymentIntentId: paymentIntent.id 
        };
      }

      // Handle other statuses
      if (paymentIntent?.status === 'processing') {
        return { 
          success: true, 
          paymentIntentId: paymentIntent.id,
          error: 'Payment is processing' 
        };
      }

      return { success: false, error: 'Payment not completed' };
    } catch (error) {
      console.error('Confirm payment error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment confirmation failed' 
      };
    } finally {
      this._isProcessing.set(false);
    }
  }

  /**
   * Clean up Stripe Elements when leaving checkout.
   */
  destroyElements(): void {
    if (this.paymentElement) {
      this.paymentElement.destroy();
      this.paymentElement = null;
    }
    this.elements = null;
  }

  /**
   * Check if Stripe is properly configured and ready.
   */
  isConfigured(): boolean {
    return this._isLoaded() && !this._loadError();
  }

  /**
   * Calculate order total from cart items (for display only).
   * Actual prices are validated server-side.
   */
  calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      const price = item.isSale && item.salePrice ? item.salePrice : item.price;
      return total + (price * item.quantity);
    }, 0);
  }

  /**
   * Format amount for display.
   */
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }
}
