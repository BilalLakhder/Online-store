import { Component, inject, signal, computed, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { DbService, Order } from '../../services/db.service';
import { PaymentService } from '../../services/payment.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { environment } from '../../environments/environment';

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

interface PromoCode {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  description: string;
  minOrder?: number;
}

// Available promo codes
const PROMO_CODES: PromoCode[] = [
  { code: 'WELCOME10', type: 'percent', value: 10, description: '10% off your order' },
  { code: 'SAVE20', type: 'percent', value: 20, description: '20% off your order', minOrder: 100 },
  { code: 'FREESHIP', type: 'fixed', value: 0, description: 'Free standard shipping' },
  { code: 'FLAT25', type: 'fixed', value: 25, description: '$25 off your order', minOrder: 75 },
];

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, RouterLink, DatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans">
      
      <!-- CONFIRMATION PAGE (Step 4) -->
      @if (currentStep() === 4) {
        <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-white animate-fade-in">
          <div class="max-w-md w-full text-center">
            <!-- Success Animation -->
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            
            <h1 class="text-4xl font-serif font-bold text-gray-900 mb-4">Thank you for your order!</h1>
            <p class="text-gray-500 mb-8">We've sent a confirmation email to <span class="font-medium text-gray-900">{{ confirmedOrder()?.customerEmail }}</span>.</p>
            
            <div class="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left">
              <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                 <span class="text-sm text-gray-500">Order Number</span>
                 <span class="font-mono font-bold text-gray-900 text-sm">{{ confirmedOrder()?.id?.slice(0, 8).toUpperCase() }}</span>
              </div>
              <div class="flex justify-between items-center mb-4">
                 <span class="text-sm text-gray-500">Date</span>
                 <span class="text-sm font-medium text-gray-900">{{ confirmedOrder()?.date | date:'mediumDate' }}</span>
              </div>
              <div class="flex justify-between items-center">
                 <span class="text-sm text-gray-500">Total</span>
                 <span class="text-lg font-bold text-gray-900">{{ confirmedOrder()?.total | currency }}</span>
              </div>
            </div>

            <div class="space-y-4">
              <button routerLink="/" class="w-full rounded-full bg-gray-900 px-8 py-4 text-white font-bold shadow-lg hover:bg-gray-800 transition-all hover:scale-105">
                Continue Shopping
              </button>
              <a routerLink="/account" class="block w-full rounded-full border border-gray-200 bg-white px-8 py-4 text-gray-900 font-bold hover:bg-gray-50 transition-colors">
                View Order History
              </a>
            </div>
          </div>
        </div>
      } @else {

      <!-- MAIN CHECKOUT FLOW -->
      <div class="flex flex-col lg:flex-row min-h-screen">
        
        <!-- LEFT SIDE: STEPS & FORM -->
        <div class="w-full lg:w-[60%] bg-white px-4 py-8 lg:px-16 lg:py-12 flex flex-col">
          <!-- Logo Header -->
          <div class="mb-8 flex items-center justify-between">
            <a routerLink="/" class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded bg-gray-900 text-white">
                <span class="font-serif font-bold text-lg">L</span>
              </div>
              <span class="text-xl font-bold tracking-tight text-gray-900 font-serif">Lumina</span>
            </a>
            <a routerLink="/cart" class="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Return to Cart
            </a>
          </div>

          <!-- Progress Stepper -->
          <nav aria-label="Progress" class="mb-12">
            <ol role="list" class="flex items-center">
              <!-- Step 1 Indicator -->
              <li class="relative pr-8 sm:pr-20">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                  <div class="h-0.5 w-full bg-gray-200"></div>
                </div>
                <button (click)="goToStep(1)" class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300"
                  [class.bg-gray-900]="currentStep() >= 1" 
                  [class.border-gray-900]="currentStep() >= 1"
                  [class.bg-white]="currentStep() < 1"
                  [class.border-gray-300]="currentStep() < 1"
                >
                   @if (currentStep() > 1) {
                     <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                   } @else {
                     <span class="h-2.5 w-2.5 rounded-full" [class.bg-white]="currentStep() === 1" [class.bg-transparent]="currentStep() !== 1"></span>
                   }
                </button>
                <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider" [class.text-gray-900]="currentStep() >= 1" [class.text-gray-400]="currentStep() < 1">Shipping</span>
              </li>
              
              <!-- Step 2 Indicator -->
              <li class="relative pr-8 sm:pr-20">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                  <div class="h-0.5 w-full bg-gray-200"></div>
                </div>
                <button (click)="goToStep(2)" [disabled]="!isStep1Valid()" class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300 disabled:cursor-not-allowed"
                  [class.bg-gray-900]="currentStep() >= 2" 
                  [class.border-gray-900]="currentStep() >= 2"
                  [class.bg-white]="currentStep() < 2"
                  [class.border-gray-300]="currentStep() < 2"
                >
                   @if (currentStep() > 2) {
                     <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                   } @else {
                     <span class="h-2.5 w-2.5 rounded-full" [class.bg-gray-300]="currentStep() < 2" [class.bg-white]="currentStep() === 2"></span>
                   }
                </button>
                <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider" [class.text-gray-900]="currentStep() >= 2" [class.text-gray-400]="currentStep() < 2">Payment</span>
              </li>

              <!-- Step 3 Indicator -->
              <li class="relative">
                <button (click)="goToStep(3)" [disabled]="!isStep2Valid()" class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300 disabled:cursor-not-allowed"
                  [class.bg-gray-900]="currentStep() >= 3" 
                  [class.border-gray-900]="currentStep() >= 3"
                  [class.bg-white]="currentStep() < 3"
                  [class.border-gray-300]="currentStep() < 3"
                >
                   <span class="h-2.5 w-2.5 rounded-full" [class.bg-gray-300]="currentStep() < 3" [class.bg-white]="currentStep() === 3"></span>
                </button>
                 <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider" [class.text-gray-900]="currentStep() >= 3" [class.text-gray-400]="currentStep() < 3">Review</span>
              </li>
            </ol>
          </nav>

          <!-- FORMS CONTAINER -->
          <div class="flex-1 max-w-xl mx-auto w-full relative overflow-hidden">
            
            <!-- STEP 1: SHIPPING -->
            @if (currentStep() === 1) {
              <div class="animate-fade-in space-y-8">
                <div>
                  <h2 class="text-2xl font-serif font-bold text-gray-900">Shipping Information</h2>
                  <p class="text-gray-500 mt-2">Where should we send your order?</p>
                </div>

                <!-- Auth Check -->
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span class="text-sm text-gray-600">Already have an account?</span>
                  <a routerLink="/login" class="text-sm font-bold text-gray-900 hover:underline">Sign in</a>
                </div>

                <!-- DEV MODE: Auto-fill button (only in development) -->
                @if (isDevMode) {
                  <button 
                    type="button"
                    (click)="devAutoFill()" 
                    class="w-full p-3 bg-purple-100 border-2 border-dashed border-purple-300 rounded-lg text-purple-700 text-sm font-medium hover:bg-purple-200 transition-colors"
                  >
                    🧪 DEV: Auto-fill test data
                  </button>
                }

                <div class="space-y-6">
                   <!-- Email -->
                   <div>
                     <label class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                     <input type="email" [(ngModel)]="form.email" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 py-3 transition-colors">
                   </div>

                   <!-- Name -->
                   <div class="grid grid-cols-2 gap-4">
                     <div>
                       <label class="block text-sm font-medium text-gray-700 mb-1">First name</label>
                       <input type="text" [(ngModel)]="form.firstName" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 py-3 transition-colors">
                     </div>
                     <div>
                       <label class="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                       <input type="text" [(ngModel)]="form.lastName" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 py-3 transition-colors">
                     </div>
                   </div>

                   <!-- Address -->
                   <div>
                     <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                     <input type="text" [(ngModel)]="form.address" placeholder="Street address" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 py-3 transition-colors">
                   </div>

                   <!-- City / Zip -->
                   <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input type="text" [(ngModel)]="form.city" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 py-3 transition-colors">
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                        <input type="text" [(ngModel)]="form.zip" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 py-3 transition-colors">
                      </div>
                   </div>

                   <!-- Phone -->
                   <div>
                     <label class="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                     <input type="tel" [(ngModel)]="form.phone" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 py-3 transition-colors">
                   </div>
                </div>

                <!-- Shipping Methods -->
                <div>
                   <h3 class="font-bold text-gray-900 mb-4">Shipping Method</h3>
                   <div class="space-y-3">
                     @for (method of shippingMethods; track method.id) {
                       <div 
                         (click)="selectShipping(method)"
                         class="relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all duration-200"
                         [class.border-gray-900]="selectedShippingMethod()?.id === method.id"
                         [class.ring-1]="selectedShippingMethod()?.id === method.id"
                         [class.ring-gray-900]="selectedShippingMethod()?.id === method.id"
                         [class.bg-gray-50]="selectedShippingMethod()?.id === method.id"
                         [class.border-gray-200]="selectedShippingMethod()?.id !== method.id"
                         [class.hover:border-gray-400]="selectedShippingMethod()?.id !== method.id"
                       >
                         <span class="flex flex-1">
                           <span class="flex flex-col">
                             <span class="block text-sm font-bold text-gray-900">{{ method.name }}</span>
                             <span class="mt-1 flex items-center text-sm text-gray-500">{{ method.description }}</span>
                             <span class="mt-1 text-xs text-gray-400 font-medium uppercase">{{ method.duration }}</span>
                           </span>
                         </span>
                         <span class="mt-0 text-sm font-bold text-gray-900">{{ method.price | currency }}</span>
                         
                         @if (selectedShippingMethod()?.id === method.id) {
                            <div class="absolute -right-2 -top-2 bg-gray-900 rounded-full p-1 text-white shadow-md">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                         }
                       </div>
                     }
                   </div>
                </div>

                <button (click)="nextStep()" [disabled]="!isStep1Valid()" class="w-full rounded-full bg-gray-900 px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Continue to Payment
                </button>
              </div>
            }

            <!-- STEP 2: PAYMENT -->
            @if (currentStep() === 2) {
              <div class="animate-fade-in space-y-8">
                <div>
                  <h2 class="text-2xl font-serif font-bold text-gray-900">Payment Details</h2>
                  <p class="text-gray-500 mt-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    All transactions are secure and encrypted.
                  </p>
                </div>

                <!-- Stripe Integration Status -->
                @if (useStripeElements()) {
                  <!-- Real Stripe Elements -->
                  @if (paymentInitializing()) {
                    <div class="flex items-center justify-center py-8">
                      <svg class="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="ml-3 text-gray-500">Initializing secure payment...</span>
                    </div>
                  }
                  
                  @if (paymentError()) {
                    <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {{ paymentError() }}
                    </div>
                  }

                  <!-- Stripe Payment Element Container -->
                  <div id="stripe-payment-element" class="min-h-[200px]"></div>

                  <!-- Order Summary for Stripe (combined step) -->
                  @if (clientSecret() && !paymentInitializing()) {
                    <div class="mt-6 pt-6 border-t border-gray-200">
                      <h3 class="font-bold text-gray-900 mb-4">Order Summary</h3>
                      <div class="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 text-sm">
                        <div class="p-3 flex justify-between bg-gray-50">
                          <span class="text-gray-600">Shipping to</span>
                          <span class="font-medium text-gray-900">{{ form.firstName }} {{ form.lastName }}, {{ form.city }}</span>
                        </div>
                        <div class="p-3 flex justify-between bg-white">
                          <span class="text-gray-600">Method</span>
                          <span class="font-medium text-gray-900">{{ selectedShippingMethod()?.name }}</span>
                        </div>
                        <div class="p-3 flex justify-between bg-gray-50">
                          <span class="text-gray-600">Total</span>
                          <span class="font-bold text-gray-900">{{ total() | currency }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Terms for Stripe -->
                    <div class="flex items-start gap-3">
                      <input type="checkbox" [(ngModel)]="termsAccepted" id="terms-stripe" class="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900">
                      <label for="terms-stripe" class="text-sm text-gray-600">
                        I agree to the <a href="#" class="underline">Terms & Conditions</a> and <a href="#" class="underline">Privacy Policy</a>.
                      </label>
                    </div>
                  }

                  <div class="flex flex-col gap-3">
                    <button 
                      (click)="placeOrder()" 
                      [disabled]="!isStep2Valid() || paymentInitializing() || isProcessing() || !termsAccepted"
                      class="w-full rounded-full bg-gray-900 px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      @if (isProcessing()) {
                        <span class="flex items-center justify-center gap-2">
                          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Processing Payment...
                        </span>
                      } @else {
                        Pay {{ total() | currency }}
                      }
                    </button>
                    <button (click)="goToStep(1)" [disabled]="isProcessing()" class="w-full rounded-full border border-transparent bg-transparent px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50">
                      Back to Shipping
                    </button>
                  </div>

                } @else {
                  <!-- Mock Payment Form (Development) -->
                  @if (isDevMode) {
                    <button 
                      type="button"
                      (click)="devAutoFillPayment()" 
                      class="w-full p-3 bg-purple-100 border-2 border-dashed border-purple-300 rounded-lg text-purple-700 text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      🧪 DEV: Auto-fill test card (4242 4242 4242 4242)
                    </button>
                  }

                  <!-- Mock Card Form -->
                  <div class="space-y-6">
                     <div>
                       <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                       <div class="relative">
                         <input 
                           type="text" 
                           [value]="payment.cardNumber"
                           (input)="formatCardNumber($event)"
                           placeholder="0000 0000 0000 0000" 
                           maxlength="19"
                           class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 py-3 pl-12 pr-16 transition-colors font-mono"
                         >
                         <div class="absolute left-3 top-1/2 -translate-y-1/2">
                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                         </div>
                         @if (payment.cardNumber.length > 0) {
                           <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                             {{ getCardType() }}
                           </span>
                         }
                       </div>
                     </div>

                     <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
                          <input 
                            type="text" 
                            [value]="payment.expiry"
                            (input)="formatExpiry($event)"
                            placeholder="MM / YY" 
                            maxlength="7"
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 py-3 transition-colors text-center"
                          >
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                          <input 
                            type="text" 
                            [(ngModel)]="payment.cvc"
                            placeholder="123" 
                            maxlength="4"
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 py-3 transition-colors text-center"
                          >
                        </div>
                     </div>
                     
                     <div>
                       <label class="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                       <input 
                         type="text" 
                         [(ngModel)]="payment.nameOnCard" 
                         [placeholder]="form.firstName + ' ' + form.lastName"
                         class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 py-3 transition-colors"
                       >
                     </div>
                  </div>

                  <div class="flex flex-col gap-3">
                    <button 
                      (click)="nextStep()" 
                      [disabled]="!isStep2Valid() || paymentInitializing()"
                      class="w-full rounded-full bg-gray-900 px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Review Order
                    </button>
                    <button (click)="goToStep(1)" class="w-full rounded-full border border-transparent bg-transparent px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                      Back to Shipping
                    </button>
                  </div>
                }
              </div>
            }

            <!-- STEP 3: REVIEW (only for mock payments - Stripe handles review in Step 2) -->
            @if (currentStep() === 3 && !useStripeElements()) {
              <div class="animate-fade-in space-y-8">
                <div>
                  <h2 class="text-2xl font-serif font-bold text-gray-900">Review Your Order</h2>
                  <p class="text-gray-500 mt-2">Please verify everything is correct.</p>
                </div>

                <div class="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                  <!-- Shipping Review -->
                  <div class="p-4 flex items-start justify-between bg-white">
                    <div class="flex gap-4">
                       <div class="text-gray-400 mt-1"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
                       <div>
                         <p class="text-sm font-medium text-gray-500">Shipping To</p>
                         <p class="font-medium text-gray-900">{{ form.firstName }} {{ form.lastName }}</p>
                         <p class="text-sm text-gray-600">{{ form.address }}</p>
                         <p class="text-sm text-gray-600">{{ form.city }}, {{ form.zip }}</p>
                       </div>
                    </div>
                    <button (click)="goToStep(1)" class="text-sm font-bold text-indigo-600 hover:underline">Edit</button>
                  </div>

                  <!-- Method Review -->
                  <div class="p-4 flex items-start justify-between bg-white">
                    <div class="flex gap-4">
                       <div class="text-gray-400 mt-1"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg></div>
                       <div>
                         <p class="text-sm font-medium text-gray-500">Method</p>
                         <p class="font-medium text-gray-900">{{ selectedShippingMethod()?.name }}</p>
                         <p class="text-sm text-gray-600">{{ selectedShippingMethod()?.duration }}</p>
                       </div>
                    </div>
                    <button (click)="goToStep(1)" class="text-sm font-bold text-indigo-600 hover:underline">Edit</button>
                  </div>

                  <!-- Payment Review -->
                  <div class="p-4 flex items-start justify-between bg-white">
                    <div class="flex gap-4">
                       <div class="text-gray-400 mt-1"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg></div>
                       <div>
                         <p class="text-sm font-medium text-gray-500">Payment</p>
                         <p class="font-medium text-gray-900">{{ getCardType() }} ending in {{ getCardLastFour() }}</p>
                         <p class="text-sm text-gray-600">{{ payment.nameOnCard }}</p>
                       </div>
                    </div>
                    <button (click)="goToStep(2)" class="text-sm font-bold text-indigo-600 hover:underline">Edit</button>
                  </div>
                </div>

                @if (paymentError()) {
                  <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {{ paymentError() }}
                  </div>
                }

                <!-- Terms -->
                <div class="flex items-start gap-3">
                  <input type="checkbox" [(ngModel)]="termsAccepted" id="terms" class="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900">
                  <label for="terms" class="text-sm text-gray-600">
                    I agree to the <a href="#" class="underline">Terms & Conditions</a> and <a href="#" class="underline">Privacy Policy</a>.
                  </label>
                </div>

                <div class="flex flex-col gap-3">
                  <button (click)="placeOrder()" [disabled]="isProcessing() || !termsAccepted" class="w-full rounded-full bg-gray-900 px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all disabled:opacity-75 disabled:cursor-wait">
                    @if(isProcessing()) {
                      <span class="flex items-center justify-center gap-2">
                        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processing Payment...
                      </span>
                    } @else {
                      Place Order • {{ total() | currency }}
                    }
                  </button>
                  <button (click)="goToStep(2)" class="w-full rounded-full border border-transparent bg-transparent px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                    Back to Payment
                  </button>
                </div>
              </div>
            }

          </div>

          <!-- Trust Badges (Visible on all steps) -->
          <div class="mt-12 pt-8 border-t border-gray-100 flex justify-center gap-8 grayscale opacity-50">
             <div class="font-bold text-xs flex flex-col items-center gap-1"><span class="block w-8 h-5 bg-gray-200 rounded"></span><span>VISA</span></div>
             <div class="font-bold text-xs flex flex-col items-center gap-1"><span class="block w-8 h-5 bg-gray-200 rounded"></span><span>MC</span></div>
             <div class="font-bold text-xs flex flex-col items-center gap-1"><span class="block w-8 h-5 bg-gray-200 rounded"></span><span>AMEX</span></div>
             <div class="font-bold text-xs flex flex-col items-center gap-1"><span class="block w-8 h-5 bg-gray-200 rounded"></span><span>PAYPAL</span></div>
          </div>
        </div>

        <!-- RIGHT SIDE: ORDER SUMMARY (Sticky) -->
        <div class="hidden lg:block w-[40%] bg-gray-50 border-l border-gray-200 px-12 py-12 relative">
          <div class="sticky top-12 space-y-8">
            <h2 class="text-xl font-bold text-gray-900">Order Summary <span class="text-gray-400 font-normal">({{ cart.count() }})</span></h2>
            
            <!-- Items List -->
            <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              @for (item of cart.items(); track item.id) {
                <div class="flex gap-4">
                  <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white relative">
                     <img [src]="item.imageUrl" [alt]="item.name" class="h-full w-full object-cover">
                     <span class="absolute top-0 right-0 bg-gray-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md">{{ item.quantity }}</span>
                  </div>
                  <div class="flex flex-1 flex-col justify-center">
                    <h3 class="text-sm font-medium text-gray-900">{{ item.name }}</h3>
                    @if (item.selectedColor || item.selectedSize) {
                      <p class="text-xs text-gray-500">{{ item.selectedColor }} {{ item.selectedSize ? '/ ' + item.selectedSize : '' }}</p>
                    }
                  </div>
                  <div class="flex flex-col justify-center items-end">
                    <p class="text-sm font-medium text-gray-900">{{ getItemPrice(item) * item.quantity | currency }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- Discount Code -->
            <div class="pt-6 border-t border-gray-200">
               @if (appliedPromo()) {
                 <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                   <div class="flex items-center gap-2">
                     <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     <div>
                       <p class="text-sm font-bold text-green-800">{{ appliedPromo()!.code }}</p>
                       <p class="text-xs text-green-600">{{ appliedPromo()!.description }}</p>
                     </div>
                   </div>
                   <button (click)="removePromo()" class="text-green-600 hover:text-green-800 text-sm font-medium">Remove</button>
                 </div>
               } @else {
                 <div class="flex gap-2">
                   <input 
                     type="text" 
                     [(ngModel)]="promoCode" 
                     placeholder="Discount code" 
                     class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 py-2.5 text-sm uppercase"
                     [class.border-red-300]="promoError()"
                   >
                   <button 
                     (click)="applyPromo()" 
                     [disabled]="!promoCode"
                     class="bg-gray-200 text-gray-900 font-bold px-4 rounded-md text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                   >Apply</button>
                 </div>
                 @if (promoError()) {
                   <p class="text-xs text-red-500 mt-2">{{ promoError() }}</p>
                 }
               }
            </div>

            <!-- Breakdown -->
            <div class="pt-6 border-t border-gray-200 space-y-3">
               <div class="flex justify-between text-sm text-gray-600">
                 <span>Subtotal</span>
                 <span>{{ cart.total() | currency }}</span>
               </div>
               @if (appliedPromo()) {
                 <div class="flex justify-between text-sm text-green-600">
                   <span>Discount ({{ appliedPromo()!.code }})</span>
                   <span>-{{ discount() | currency }}</span>
                 </div>
               }
               <div class="flex justify-between text-sm text-gray-600">
                 <span>Shipping</span>
                 <span>{{ selectedShippingMethod() ? (selectedShippingMethod()!.price | currency) : 'Calculated next step' }}</span>
               </div>
               <div class="flex justify-between text-sm text-gray-600">
                 <span>Taxes (Estimated)</span>
                 <span>{{ tax() | currency }}</span>
               </div>
               <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                 <span class="text-lg font-bold text-gray-900">Total</span>
                 <span class="text-2xl font-serif font-bold text-gray-900">{{ total() | currency }}</span>
               </div>
            </div>
            
            <div class="flex items-center gap-2 text-xs text-gray-400 justify-center">
               <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
               Secure Checkout
            </div>
          </div>
        </div>

        <!-- MOBILE SUMMARY ACCORDION -->
        <div class="lg:hidden w-full bg-gray-50 border-b border-gray-200 p-4 order-first">
           <details class="group">
              <summary class="flex justify-between items-center font-bold text-gray-900 cursor-pointer list-none">
                 <span class="flex items-center gap-2">
                   Show Order Summary <span class="text-gray-400 font-normal">({{ cart.count() }})</span>
                   <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                 </span>
                 <span>{{ total() | currency }}</span>
              </summary>
              <div class="mt-4 space-y-4 pt-4 border-t border-gray-200">
                 @for (item of cart.items(); track item.id) {
                    <div class="flex gap-4">
                      <div class="h-14 w-14 rounded-lg bg-white border border-gray-200 overflow-hidden relative">
                         <img [src]="item.imageUrl" class="h-full w-full object-cover">
                         <span class="absolute top-0 right-0 bg-gray-500 text-white text-[9px] px-1.5 rounded-bl">{{ item.quantity }}</span>
                      </div>
                      <div class="flex-1">
                         <p class="text-sm font-bold">{{ item.name }}</p>
                         <p class="text-xs text-gray-500">{{ getItemPrice(item) | currency }}</p>
                      </div>
                      <p class="text-sm font-medium">{{ getItemPrice(item) * item.quantity | currency }}</p>
                    </div>
                 }
                 <div class="pt-4 border-t border-gray-200 space-y-2 text-sm">
                    <div class="flex justify-between"><span>Subtotal</span><span>{{ cart.total() | currency }}</span></div>
                    <div class="flex justify-between"><span>Shipping</span><span>{{ selectedShippingMethod()?.price || 0 | currency }}</span></div>
                 </div>
              </div>
           </details>
        </div>

      </div>
      }
    </div>
  `
})
export class CheckoutComponent implements OnDestroy, AfterViewInit {
  cart = inject(CartService);
  db = inject(DbService);
  router = inject(Router);
  paymentService = inject(PaymentService);

  isDevMode = !environment.production;

  currentStep = signal(1);
  isProcessing = signal(false);
  confirmedOrder = signal<Order | null>(null);
  
  // Payment state
  paymentInitializing = signal(false);
  paymentError = signal<string | null>(null);
  clientSecret = signal<string | null>(null);
  termsAccepted = false;
  
  // Promo code
  promoCode = '';
  appliedPromo = signal<PromoCode | null>(null);
  promoError = signal<string | null>(null);

  form = {
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    phone: ''
  };

  payment = {
    cardNumber: '',
    expiry: '',
    cvc: '',
    nameOnCard: ''
  };

  shippingMethods: ShippingMethod[] = [
    { id: 'standard', name: 'Standard Shipping', price: 5.99, duration: '5-7 business days', description: 'Reliable ground shipping' },
    { id: 'express', name: 'Express Shipping', price: 12.99, duration: '2-3 business days', description: 'Faster delivery with tracking' },
    { id: 'overnight', name: 'Overnight', price: 24.99, duration: '1 business day', description: 'Next day delivery guaranteed' }
  ];

  selectedShippingMethod = signal<ShippingMethod | null>(this.shippingMethods[0]);

  // Check if Stripe is configured and should be used
  useStripeElements = computed(() => {
    return this.paymentService.isConfigured();
  });

  discount = computed(() => {
    const promo = this.appliedPromo();
    if (!promo) return 0;
    
    if (promo.type === 'percent') {
      return this.cart.total() * (promo.value / 100);
    }
    return promo.value;
  });

  tax = computed(() => (this.cart.total() - this.discount()) * 0.08);

  total = computed(() => {
    const shipping = this.selectedShippingMethod()?.price || 0;
    const subtotal = this.cart.total() - this.discount();
    return subtotal + this.tax() + shipping;
  });

  ngAfterViewInit() {
    // Initialize Stripe Elements when moving to payment step if configured
  }

  ngOnDestroy() {
    this.paymentService.destroyElements();
  }

  getItemPrice(item: { price: number; isSale?: boolean; salePrice?: number }): number {
    return item.isSale && item.salePrice ? item.salePrice : item.price;
  }

  isStep1Valid(): boolean {
    return !!(this.form.email && this.form.firstName && this.form.address && this.form.city && this.form.zip);
  }

  isStep2Valid(): boolean {
    if (this.useStripeElements()) {
      // For Stripe, we check if payment intent was created
      return !!this.clientSecret();
    }
    // For mock, check manual form
    return !!(this.payment.cardNumber && this.payment.expiry && this.payment.cvc && this.payment.nameOnCard);
  }

  selectShipping(method: ShippingMethod) {
    this.selectedShippingMethod.set(method);
  }

  goToStep(step: number) {
    if (step === 2 && !this.isStep1Valid()) return;
    if (step === 3 && !this.isStep2Valid()) return;
    
    this.currentStep.set(step);
    window.scrollTo(0, 0);

    // Initialize payment when entering step 2
    if (step === 2 && this.useStripeElements()) {
      this.initializeStripePayment();
    }
  }

  nextStep() {
    const next = this.currentStep() + 1;
    this.goToStep(next);
  }

  private async initializeStripePayment() {
    if (this.clientSecret()) return; // Already initialized

    this.paymentInitializing.set(true);
    this.paymentError.set(null);

    try {
      // Create payment intent via Edge Function
      const { data, error } = await this.paymentService.createPaymentIntent(
        this.cart.items(),
        this.form.email,
        this.selectedShippingMethod()?.price || 0,
        this.appliedPromo()?.code
      );

      if (error || !data) {
        this.paymentError.set(error || 'Failed to initialize payment');
        return;
      }

      this.clientSecret.set(data.clientSecret);

      // Initialize Stripe Elements
      const initResult = await this.paymentService.initializeElements(
        data.clientSecret,
        'stripe-payment-element'
      );

      if (!initResult.success) {
        this.paymentError.set(initResult.error || 'Failed to load payment form');
      }
    } catch (err) {
      this.paymentError.set('Network error initializing payment');
    } finally {
      this.paymentInitializing.set(false);
    }
  }

  // Format card number with spaces
  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '').replace(/\D/g, '');
    value = value.substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    this.payment.cardNumber = formatted;
  }

  // Format expiry (MM/YY)
  formatExpiry(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + ' / ' + value.substring(2);
    }
    this.payment.expiry = value;
  }

  getCardLastFour(): string {
    const digits = this.payment.cardNumber.replace(/\s/g, '');
    return digits.length >= 4 ? digits.slice(-4) : '****';
  }

  getCardType(): string {
    const number = this.payment.cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'Amex';
    if (/^6011|65|64[4-9]/.test(number)) return 'Discover';
    return 'Card';
  }

  applyPromo() {
    this.promoError.set(null);
    const code = this.promoCode.toUpperCase().trim();
    
    const promo = PROMO_CODES.find(p => p.code === code);
    
    if (!promo) {
      this.promoError.set('Invalid promo code');
      return;
    }
    
    if (promo.minOrder && this.cart.total() < promo.minOrder) {
      this.promoError.set(`Minimum order of $${promo.minOrder} required`);
      return;
    }
    
    this.appliedPromo.set(promo);
    this.promoCode = '';
  }

  removePromo() {
    this.appliedPromo.set(null);
    this.promoError.set(null);
  }

  // Dev mode helpers
  devAutoFill() {
    this.form = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Test Street',
      city: 'San Francisco',
      zip: '94102',
      phone: '555-123-4567'
    };
    this.promoCode = 'WELCOME10';
    this.applyPromo();
  }

  devAutoFillPayment() {
    this.payment = {
      cardNumber: '4242 4242 4242 4242',
      expiry: '12 / 28',
      cvc: '123',
      nameOnCard: `${this.form.firstName} ${this.form.lastName}`
    };
  }

  async placeOrder() {
    this.isProcessing.set(true);
    this.paymentError.set(null);
    
    try {
      if (this.useStripeElements() && this.clientSecret()) {
        // Process real Stripe payment
        const result = await this.paymentService.confirmPayment(
          `${window.location.origin}/checkout?success=true`
        );

        if (!result.success) {
          this.paymentError.set(result.error || 'Payment failed');
          return;
        }

        // Payment succeeded - create order
        const order = await this.db.createOrder({
          customerName: `${this.form.firstName} ${this.form.lastName}`,
          customerEmail: this.form.email,
          items: this.cart.items(),
          total: this.total(),
          shippingAddress: `${this.form.address}, ${this.form.city}, ${this.form.zip}`
        });

        if (order) {
          this.confirmedOrder.set(order);
          this.cart.clearCart();
          this.currentStep.set(4);
          window.scrollTo(0, 0);
        }
      } else {
        // Mock payment flow (development)
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const order = await this.db.createOrder({
          customerName: `${this.form.firstName} ${this.form.lastName}`,
          customerEmail: this.form.email,
          items: this.cart.items(),
          total: this.total(),
          shippingAddress: `${this.form.address}, ${this.form.city}, ${this.form.zip}`
        });
        
        if (order) {
          this.confirmedOrder.set(order);
          this.cart.clearCart();
          this.currentStep.set(4);
          window.scrollTo(0, 0);
        }
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      this.paymentError.set('An unexpected error occurred. Please try again.');
    } finally {
      this.isProcessing.set(false);
    }
  }
}
