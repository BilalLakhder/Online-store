import { Component, input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../services/db.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div 
      class="group relative flex flex-col h-full rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-transparent hover:border-gray-100"
      (mouseenter)="isHovered.set(true)"
      (mouseleave)="isHovered.set(false)"
    >
      <!-- Image Container -->
      <div class="aspect-[3/4] w-full overflow-hidden rounded-t-2xl rounded-b-lg bg-gray-100 relative mb-3 shadow-none">
        
        <!-- Badges -->
        <div class="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
          @if (product().isNew) {
            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-gray-900 text-[10px] font-bold uppercase tracking-widest shadow-sm border border-gray-100">New</span>
          }
          @if (product().isSale) {
            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-accent-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-sm">Sale</span>
          }
        </div>

        <!-- Wishlist Button -->
        <button 
          (click)="toggleWishlist($event)"
          class="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-sm transform translate-y-2 group-hover:translate-y-0"
          [class.text-red-500]="inWishlist()"
          aria-label="Add to wishlist"
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" [attr.fill]="inWishlist() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>

        <!-- Main Image with Scale -->
        <div class="relative h-full w-full overflow-hidden">
           <img 
            [src]="product().imageUrl" 
            [alt]="product().name"
            class="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
            [class.opacity-0]="isHovered() && product().images && product().images!.length > 1"
          >
          @if (product().images && product().images!.length > 1) {
             <img 
              [src]="product().images![1]" 
              [alt]="product().name"
              class="absolute inset-0 h-full w-full object-cover object-center transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-110"
            >
          }
        </div>
        
        <!-- Quick Add Button (Slide Up) -->
        <div class="absolute inset-x-4 bottom-4 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
          <button 
            (click)="addToCart($event)"
            class="w-full bg-gray-900 text-white py-3 px-4 rounded-full shadow-xl font-bold text-xs uppercase tracking-wide hover:bg-black flex items-center justify-center gap-2 transition-all active:scale-95"
          >
             <span>Add to Cart</span>
          </button>
        </div>
        
        <!-- Link to detail -->
        <a [routerLink]="['/product', product().id]" class="absolute inset-0 z-10">
          <span class="sr-only">View {{product().name}}</span>
        </a>
      </div>

      <!-- Details -->
      <div class="flex flex-col flex-1 space-y-2 px-3 pb-3">
        <h3 class="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-accent-600 transition-colors duration-200">
          <a [routerLink]="['/product', product().id]">{{ product().name }}</a>
        </h3>
        
        <div class="flex items-center justify-between">
           <div class="flex items-center gap-2">
             @if (product().isSale) {
               <span class="text-sm font-bold text-accent-600">{{ product().salePrice | currency }}</span>
               <span class="text-xs text-gray-400 line-through">{{ product().price | currency }}</span>
             } @else {
               <span class="text-sm font-medium text-gray-900">{{ product().price | currency }}</span>
             }
           </div>
           
           <!-- Mini Rating -->
           <div class="flex items-center gap-1">
             <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
             <span class="text-xs text-gray-400">{{ product().rating }}</span>
           </div>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  product = input.required<Product>();
  cart = inject(CartService);
  
  isHovered = signal(false);
  inWishlist = signal(false);

  addToCart(e: Event) {
    e.stopPropagation(); // Prevent navigation
    e.preventDefault();
    this.cart.addToCart(this.product());
  }

  toggleWishlist(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.inWishlist.update(v => !v);
  }
}