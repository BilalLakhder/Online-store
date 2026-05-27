// Supabase Edge Function: create-payment-intent
// This function creates a Stripe PaymentIntent with server-side price validation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CartItem {
  id: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface RequestBody {
  items: CartItem[];
  customerEmail: string;
  shippingCost?: number;
  promoCode?: string;
}

// Promo codes (in production, store these in database)
const PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; value: number; minOrder?: number }> = {
  'WELCOME10': { type: 'percent', value: 10 },
  'SAVE20': { type: 'percent', value: 20, minOrder: 100 },
  'FLAT25': { type: 'fixed', value: 25, minOrder: 75 },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { items, customerEmail, shippingCost = 0, promoCode }: RequestBody = await req.json();

    if (!items || items.length === 0) {
      throw new Error('No items in cart');
    }

    if (!customerEmail) {
      throw new Error('Customer email is required');
    }

    // Fetch product prices from database (NEVER trust client-side prices)
    const productIds = items.map(item => item.id);
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, price, is_sale, sale_price, inventory')
      .in('id', productIds);

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      throw new Error('No valid products found');
    }

    // Calculate total server-side
    let subtotal = 0;
    const lineItems: { productId: string; name: string; quantity: number; unitPrice: number }[] = [];

    for (const cartItem of items) {
      const product = products.find(p => p.id === cartItem.id);
      
      if (!product) {
        throw new Error(`Product ${cartItem.id} not found`);
      }

      // Check inventory
      if (product.inventory < cartItem.quantity) {
        throw new Error(`Insufficient inventory for ${product.name}. Available: ${product.inventory}`);
      }

      // Use sale price if applicable, otherwise regular price
      const unitPrice = product.is_sale && product.sale_price 
        ? Number(product.sale_price) 
        : Number(product.price);
      
      const itemTotal = unitPrice * cartItem.quantity;
      subtotal += itemTotal;

      lineItems.push({
        productId: product.id,
        name: product.name,
        quantity: cartItem.quantity,
        unitPrice,
      });
    }

    // Apply promo code discount
    let discount = 0;
    if (promoCode) {
      const promo = PROMO_CODES[promoCode.toUpperCase()];
      if (promo) {
        if (!promo.minOrder || subtotal >= promo.minOrder) {
          discount = promo.type === 'percent' 
            ? subtotal * (promo.value / 100) 
            : promo.value;
        }
      }
    }

    // Calculate tax (8% example)
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * 0.08;

    // Final total
    const total = taxableAmount + tax + shippingCost;
    
    // Convert to cents for Stripe
    const amountInCents = Math.round(total * 100);

    if (amountInCents < 50) {
      throw new Error('Order total must be at least $0.50');
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerEmail,
        itemCount: items.length.toString(),
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        tax: tax.toFixed(2),
        shipping: shippingCost.toFixed(2),
        promoCode: promoCode || '',
        lineItems: JSON.stringify(lineItems.map(li => ({
          id: li.productId,
          qty: li.quantity,
          price: li.unitPrice
        }))),
      },
      receipt_email: customerEmail,
    });

    // Return client secret and calculated amounts
    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: total,
        breakdown: {
          subtotal,
          discount,
          tax,
          shipping: shippingCost,
          total,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment intent error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
