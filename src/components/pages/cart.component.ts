import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { DbService } from '../../services/db.service';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DecimalPipe],
  template: `
    <div class="bg-white min-h-screen font-sans">
      <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-serif font-bold tracking-tight text-gray-900 mb-2">Shopping Cart</h1>
        <p class="text-sm text-gray-500 mb-12">
          {{ cart.count() }} items in your cart
          @if(cart.count() > 0 && freeShippingProgress() >= 100) {
             <span class="mx-2 text-gray-300">|</span> <span class="text-green-600 font-medium">Free shipping unlocked</span>
          }
        </p>

        <div class="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          <div class="lg:col-span-8">
             <!-- Free Shipping Bar -->
             @if(cart.items().length > 0) {
                <div class="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                   <div class="flex justify-between text-sm font-medium mb-3">
                      <span class="{{ freeShippingProgress() >= 100 ? 'text-green-600' : 'text-gray-900' }}">
                         {{ freeShippingProgress() >= 100 ? '🎉 You have unlocked Free Shipping!' : 'Spend ' + (50 - cart.total() | currency) + ' more for Free Shipping' }}
                      </span>
                      <span class="text-gray-500">{{ freeShippingProgress() | number:'1.0-0' }}%</span>
                   </div>
                   <div class="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full bg-gray-900 transition-all duration-1000 ease-out" [style.width.%]="freeShippingProgress()" [class.bg-green-500]="freeShippingProgress() >= 100"></div>
                   </div>
                </div>
             }

            @if (cart.items().length === 0) {
              <div class="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <span class="text-4xl">🛒</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                <p class="text-gray-500 mb-10 max-w-sm mx-auto">Looks like you haven't added any premium goods to your cart yet.</p>
                <a routerLink="/shop" class="inline-flex items-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-white bg-gray-900 hover:bg-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  Start Shopping
                </a>
              </div>
            } @else {
              <ul role="list" class="divide-y divide-gray-100 border-t border-gray-100">
                @for (item of cart.items(); track item.id) {
                  <li class="flex py-10">
                    <div class="flex-shrink-0">
                      <img [src]="item.imageUrl" [alt]="item.name" class="h-[120px] w-[120px] rounded-2xl object-cover bg-gray-100 border border-gray-100 shadow-sm">
                    </div>

                    <div class="ml-8 flex flex-1 flex-col justify-between">
                      <div class="flex justify-between">
                        <div>
                          <h3 class="text-lg font-bold text-gray-900">
                            <a [routerLink]="['/product', item.id]" class="hover:text-accent-600 transition-colors">{{ item.name }}</a>
                          </h3>
                          <p class="mt-1 text-sm text-gray-500">{{ item.category }}</p>
                          @if(item.inventory < 10) {
                             <p class="mt-2 text-xs font-medium text-orange-600 flex items-center gap-1">
                               <span class="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Only {{ item.inventory }} left
                             </p>
                          }
                        </div>
                        <p class="text-lg font-bold text-gray-900">{{ item.price | currency }}</p>
                      </div>

                      <div class="flex items-center justify-between mt-4">
                         <!-- Circular Quantity Controls -->
                        <div class="flex items-center gap-4">
                             <div class="flex items-center gap-3 bg-white">
                                 <button type="button" (click)="cart.updateQuantity(item.id, -1)" 
                                   class="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50 hover:border-gray-300"
                                   [disabled]="item.quantity <= 1">
                                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                                 </button>
                                 <span class="text-sm font-bold text-gray-900 w-4 text-center">{{ item.quantity }}</span>
                                 <button type="button" (click)="cart.updateQuantity(item.id, 1)" 
                                   class="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors hover:border-gray-300">
                                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                 </button>
                             </div>
                        </div>

                        <div class="flex items-center gap-4">
                            <button type="button" class="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors underline-offset-4 hover:underline">
                               Save for Later
                            </button>
                            <span class="text-gray-200">|</span>
                            <button type="button" (click)="removeItem(item.id)" class="text-sm font-medium text-red-600 hover:text-red-500 transition-colors hover:underline">
                               Remove
                            </button>
                        </div>
                      </div>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>

          <!-- Order Summary (Right Column) -->
          @if (cart.items().length > 0) {
            <section class="mt-16 rounded-3xl bg-gray-50 px-8 py-10 lg:col-span-4 lg:mt-0 shadow-sm border border-gray-100 h-fit sticky top-24">
              <h2 class="text-xl font-bold text-gray-900 mb-8">Order Summary</h2>

              <dl class="space-y-4">
                <div class="flex items-center justify-between">
                  <dt class="text-sm text-gray-600">Subtotal</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ cart.total() | currency }}</dd>
                </div>
                <div class="flex items-center justify-between">
                  <dt class="text-sm text-gray-600">Shipping</dt>
                  <dd class="text-sm font-medium" [class.text-green-600]="freeShippingProgress() >= 100" [class.text-gray-900]="freeShippingProgress() < 100">
                     @if(freeShippingProgress() >= 100) { Free } @else { $5.99 }
                  </dd>
                </div>
                 <div class="flex items-center justify-between">
                  <dt class="text-sm text-gray-600">Tax Estimate</dt>
                  <dd class="text-sm font-medium text-gray-900">{{ cart.total() * 0.08 | currency }}</dd>
                </div>
                <div class="flex items-center justify-between border-t border-gray-200 pt-6 mt-6">
                  <dt class="text-xl font-serif font-bold text-gray-900">Total</dt>
                  <dd class="text-xl font-serif font-bold text-gray-900">{{ (cart.total() * 1.08) + (freeShippingProgress() >= 100 ? 0 : 5.99) | currency }}</dd>
                </div>
              </dl>

              <div class="mt-8">
                <button 
                  routerLink="/checkout" 
                  class="w-full rounded-full border border-transparent bg-gray-900 px-6 py-4 text-base font-bold text-white shadow-xl hover:bg-gray-800 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <span class="text-lg">→</span>
                </button>
                <div class="mt-6 flex flex-col items-center gap-3">
                   <div class="flex gap-2 opacity-50 grayscale">
                      <div class="w-8 h-5 bg-gray-300 rounded"></div>
                      <div class="w-8 h-5 bg-gray-300 rounded"></div>
                      <div class="w-8 h-5 bg-gray-300 rounded"></div>
                   </div>
                   <p class="text-xs text-center text-gray-400">
                      Secure checkout powered by Stripe.
                   </p>
                </div>
              </div>
            </section>
          }
        </div>
        
        <!-- Recommendations Section -->
        @if(recommendations().length > 0) {
           <div class="mt-32 pt-16 border-t border-gray-100">
              <h2 class="text-3xl font-serif font-bold text-gray-900 mb-10">You might also like</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                 @for(product of recommendations(); track product.id) {
                    <!-- Simplified Product Card -->
                    <div class="group relative">
                       <div class="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 mb-4 relative">
                          <img [src]="product.imageUrl" class="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500">
                          <button (click)="cart.addToCart(product)" class="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-gray-50 text-gray-900" title="Add to Cart">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                          </button>
                       </div>
                       <h3 class="text-sm font-bold text-gray-900">
                          <a [routerLink]="['/product', product.id]">{{ product.name }}</a>
                       </h3>
                       <p class="text-sm text-gray-500 mt-1">{{ product.price | currency }}</p>
                    </div>
                 }
              </div>
           </div>
        }

      </div>
    </div>
  `
})
export class CartComponent {
  cart = inject(CartService);
  db = inject(DbService);

  freeShippingProgress = computed(() => {
    return Math.min(100, (this.cart.total() / 50) * 100);
  });

  recommendations = computed(() => {
    // Get products not in cart, simple slice for demo
    const cartIds = new Set(this.cart.items().map(i => i.id));
    return this.db.products().filter(p => !cartIds.has(p.id)).slice(0, 4);
  });

  removeItem(id: string) {
    if(confirm('Are you sure you want to remove this item?')) {
      this.cart.removeFromCart(id);
    }
  }
}