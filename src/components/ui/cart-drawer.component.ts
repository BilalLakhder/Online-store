import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CurrencyPipe } from '@angular/common';
import { CartItem } from '../../services/db.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="fixed inset-0 z-[100]" [class.pointer-events-none]="!cart.isOpen()">
      <!-- Backdrop -->
      <div 
        (click)="cart.close()" 
        class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out"
        [class.opacity-0]="!cart.isOpen()"
        [class.opacity-100]="cart.isOpen()"
      ></div>

      <!-- Drawer Panel -->
      <div 
        class="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-500 cubic-bezier(0.25, 1, 0.5, 1) flex flex-col pointer-events-auto"
        [class.translate-x-full]="!cart.isOpen()"
        [class.translate-x-0]="cart.isOpen()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 class="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Your Cart
            <span class="text-sm font-sans font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {{ cart.count() }} items
            </span>
          </h2>
          <button (click)="cart.close()" class="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Free Shipping Bar -->
        @if (cart.items().length > 0) {
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-100">
            @if (freeShippingProgress() >= 100) {
              <p class="text-sm font-medium text-green-600 flex items-center gap-2 mb-2">
                <span class="text-lg">🎉</span> You've unlocked free shipping!
              </p>
            } @else {
               <p class="text-sm text-gray-600 mb-2">
                 Add <span class="font-bold text-gray-900">{{ 50 - cart.total() | currency }}</span> more for free shipping 🚚
               </p>
            }
            <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-gray-900 to-gray-700 transition-all duration-1000 ease-out"
                [style.width.%]="freeShippingProgress()"
                [class.bg-green-500]="freeShippingProgress() >= 100"
                [class.from-green-500]="freeShippingProgress() >= 100"
                [class.to-green-400]="freeShippingProgress() >= 100"
              ></div>
            </div>
          </div>
        }

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
          @if (cart.items().length === 0) {
            <div class="flex flex-col items-center justify-center h-full text-center py-12">
               <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                 <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
               </div>
               <h3 class="text-lg font-bold text-gray-900 mb-2">Your cart is empty</h3>
               <p class="text-gray-500 mb-8 max-w-[200px]">Discover our collection of premium products</p>
               <button (click)="cart.close()" routerLink="/shop" class="px-8 py-3 bg-gray-900 text-white font-bold rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-105 active:scale-95">
                 Start Shopping
               </button>
               
               <!-- Recommendations Mock -->
               <div class="mt-12 w-full border-t border-gray-100 pt-8">
                 <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Trending Now</p>
                 <div class="grid grid-cols-2 gap-4">
                    <div class="group cursor-pointer text-left">
                       <div class="aspect-square bg-gray-100 rounded-lg mb-2 relative overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=200" class="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500">
                       </div>
                       <p class="text-sm font-medium text-gray-900 truncate">Minimalist Chronograph</p>
                       <p class="text-xs text-gray-500">$199.00</p>
                    </div>
                    <div class="group cursor-pointer text-left">
                       <div class="aspect-square bg-gray-100 rounded-lg mb-2 relative overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1544075199-52e804f86f74?auto=format&fit=crop&q=80&w=200" class="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500">
                       </div>
                       <p class="text-sm font-medium text-gray-900 truncate">Ceramic Pour-Over</p>
                       <p class="text-xs text-gray-500">$85.00</p>
                    </div>
                 </div>
               </div>
            </div>
          } @else {
            @for (item of cart.items(); track item.id) {
              <div class="flex gap-4 group animate-fade-in">
                <!-- Image -->
                <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <img [src]="item.imageUrl" [alt]="item.name" class="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500">
                </div>

                <!-- Info -->
                <div class="flex flex-1 flex-col justify-between">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="text-base font-medium text-gray-900">
                        <a [routerLink]="['/product', item.id]" (click)="cart.close()">{{ item.name }}</a>
                      </h3>
                      @if (item.isSale && item.salePrice) {
                        <p class="mt-1 text-sm text-red-500 font-medium">Sale</p>
                      }
                    </div>
                    <button 
                      (click)="removeItem(item)" 
                      class="text-gray-400 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>

                  <div class="flex items-center justify-between">
                    <!-- Qty Controls -->
                    <div class="flex items-center border border-gray-200 rounded-md">
                      <button 
                        (click)="cart.updateQuantity(item.id, -1)" 
                        [disabled]="item.quantity <= 1"
                        class="p-1 px-2 hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                      >-</button>
                      <span class="text-xs font-medium w-6 text-center text-gray-900">{{ item.quantity }}</span>
                      <button 
                        (click)="cart.updateQuantity(item.id, 1)" 
                        class="p-1 px-2 hover:bg-gray-50 text-gray-600 transition-colors"
                      >+</button>
                    </div>
                    
                    <p class="text-sm font-semibold text-gray-900">{{ getItemTotal(item) | currency }}</p>
                  </div>
                </div>
              </div>
            }
          }
        </div>

        <!-- Sticky Footer -->
        @if (cart.items().length > 0) {
          <div class="border-t border-gray-100 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <!-- Trust Indicators -->
            <div class="flex justify-center gap-4 mb-6 text-[10px] text-gray-500 uppercase tracking-wider font-medium">
               <span class="flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> Secure Checkout</span>
               <span class="flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg> Free Returns</span>
            </div>

            <div class="flex justify-between text-base font-medium text-gray-900 mb-2">
              <p>Subtotal</p>
              <p>{{ cart.total() | currency }}</p>
            </div>
            <p class="mt-0.5 text-xs text-gray-500 mb-6 text-right">Shipping and taxes calculated at checkout.</p>
            <div class="space-y-3">
              <a 
                routerLink="/checkout" 
                (click)="cart.close()"
                class="flex w-full items-center justify-center rounded-full border border-transparent bg-gray-900 px-6 py-4 text-base font-bold text-white shadow-xl hover:bg-gray-800 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Proceed to Checkout
              </a>
              <button 
                routerLink="/shop"
                (click)="cart.close()"
                class="flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        }
        
        <!-- Undo Toast (Absolute inside drawer) -->
        @if (removedItem(); as item) {
           <div class="absolute bottom-6 left-6 right-6 bg-gray-900 text-white p-4 rounded-lg shadow-xl flex items-center justify-between animate-slide-up z-20">
              <span class="text-sm">Removed {{item.name}}</span>
              <button (click)="undoRemove()" class="text-sm font-bold text-accent-500 hover:text-accent-400">UNDO</button>
           </div>
        }
      </div>
    </div>
  `
})
export class CartDrawerComponent {
  cart = inject(CartService);
  
  removedItem = signal<CartItem | null>(null);
  undoTimeout: any;

  freeShippingProgress = computed(() => {
    return Math.min(100, (this.cart.total() / 50) * 100);
  });

  getItemTotal(item: CartItem): number {
    const price = item.isSale && item.salePrice ? item.salePrice : item.price;
    return price * item.quantity;
  }

  removeItem(item: CartItem) {
    this.cart.removeFromCart(item.id);
    
    // Undo Logic
    this.removedItem.set(item);
    if (this.undoTimeout) clearTimeout(this.undoTimeout);
    this.undoTimeout = setTimeout(() => {
      this.removedItem.set(null);
    }, 5000);
  }

  undoRemove() {
    const item = this.removedItem();
    if (item) {
      this.cart.restoreItem(item);
      this.removedItem.set(null);
      if (this.undoTimeout) clearTimeout(this.undoTimeout);
    }
  }
}