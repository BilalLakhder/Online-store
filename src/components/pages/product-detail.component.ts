import { Component, inject, computed, signal, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DbService, Product } from '../../services/db.service';
import { CartService } from '../../services/cart.service';
import { MetaService } from '../../services/meta.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  template: `
    <div class="bg-white min-h-screen">
      @if (product(); as p) {
        <!-- Breadcrumb -->
        <nav aria-label="Breadcrumb" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <ol role="list" class="flex items-center space-x-2 text-sm text-gray-500">
            <li><a routerLink="/" class="hover:text-gray-900 transition-colors">Home</a></li>
            <li><span class="text-gray-300">/</span></li>
            <li><a routerLink="/shop" class="hover:text-gray-900 transition-colors">Shop</a></li>
            <li><span class="text-gray-300">/</span></li>
            <li><span class="font-medium text-gray-900">{{ p.name }}</span></li>
          </ol>
        </nav>

        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
          <div class="lg:grid lg:grid-cols-2 lg:gap-x-16">
            <!-- Image Gallery -->
            <div class="flex flex-col gap-6">
              <div class="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 relative group shadow-sm">
                <img 
                  [src]="selectedImage() || p.imageUrl" 
                  [alt]="p.name" 
                  class="h-full w-full object-cover object-center transition-transform duration-700 cursor-zoom-in group-hover:scale-105"
                >
                <!-- Badges -->
                <div class="absolute top-4 left-4 flex gap-2">
                   @if(p.isNew) { <span class="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-widest shadow-sm">New</span> }
                   @if(p.isSale) { <span class="bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-widest shadow-sm">Sale</span> }
                </div>
              </div>
              
              <!-- Thumbnails -->
              @if (p.images && p.images.length > 1) {
                <div class="grid grid-cols-4 gap-4">
                  @for (img of p.images; track img; let i = $index) {
                    <button 
                      (click)="selectedImage.set(img)"
                      class="aspect-square rounded-xl bg-gray-100 overflow-hidden transition-all"
                      [class]="selectedImage() === img || (!selectedImage() && i === 0) 
                        ? 'ring-2 ring-gray-900 ring-offset-2' 
                        : 'opacity-60 hover:opacity-100'"
                    >
                      <img [src]="img" class="h-full w-full object-cover">
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Product Info -->
            <div class="mt-12 lg:mt-0 lg:sticky lg:top-24 h-fit">
              <div class="border-b border-gray-100 pb-8">
                 <h1 class="text-4xl font-serif font-bold tracking-tight text-gray-900 mb-4">{{ p.name }}</h1>
                 <div class="flex items-center gap-6">
                    <div class="flex items-baseline gap-3">
                      @if (p.isSale && p.salePrice) {
                        <p class="text-3xl font-medium tracking-tight text-red-600">{{ p.salePrice | currency }}</p>
                        <p class="text-xl text-gray-400 line-through">{{ p.price | currency }}</p>
                      } @else {
                        <p class="text-3xl font-medium tracking-tight text-gray-900">{{ p.price | currency }}</p>
                      }
                    </div>
                    
                    <div class="flex items-center gap-2 border-l border-gray-200 pl-6">
                      <div class="flex text-yellow-400 text-sm">
                         @for(star of [1,2,3,4,5]; track star) { 
                           <svg class="w-4 h-4" [class.text-gray-200]="star > Math.round(p.rating)" fill="currentColor" viewBox="0 0 20 20">
                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                           </svg> 
                         }
                      </div>
                      <span class="text-sm text-gray-500">{{ p.reviewCount }} reviews</span>
                    </div>
                 </div>
              </div>

              <div class="py-8">
                <p class="text-base text-gray-600 leading-relaxed">{{ p.description }}</p>
              </div>
              
              <!-- Color Selection -->
              @if (p.colors && p.colors.length > 0) {
                <div class="mb-8">
                  <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                    Color
                    @if (selectedColor()) {
                      <span class="font-normal text-gray-500 ml-2 normal-case">{{ getColorName(selectedColor()!) }}</span>
                    }
                  </h3>
                  <div class="flex gap-3">
                    @for (color of p.colors; track color) {
                      <button 
                        (click)="selectedColor.set(color)"
                        class="w-10 h-10 rounded-full shadow-sm transition-all border-2"
                        [style.backgroundColor]="color"
                        [class]="selectedColor() === color 
                          ? 'ring-2 ring-offset-2 ring-gray-900 border-white' 
                          : 'border-gray-200 hover:scale-110'"
                        [attr.aria-label]="'Select ' + getColorName(color)"
                      ></button>
                    }
                  </div>
                </div>
              }

              <!-- Size Selection -->
              @if (p.sizes && p.sizes.length > 0 && p.sizes[0] !== 'One Size') {
                <div class="mb-8">
                  <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Size</h3>
                  <div class="flex flex-wrap gap-3">
                    @for (size of p.sizes; track size) {
                      <button 
                        (click)="selectedSize.set(size)"
                        class="px-4 py-2 border rounded-lg text-sm font-medium transition-all"
                        [class]="selectedSize() === size 
                          ? 'border-gray-900 bg-gray-900 text-white' 
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'"
                      >
                        {{ size }}
                      </button>
                    }
                  </div>
                </div>
              }

              <div class="flex flex-col gap-6">
                 @if (p.inventory > 0) {
                   <div class="flex gap-4">
                     <!-- Qty -->
                     <div class="flex items-center border border-gray-200 rounded-lg">
                        <button (click)="decrementQty()" class="px-5 py-4 hover:bg-gray-50 text-gray-600 font-medium transition-colors">-</button>
                        <span class="px-4 font-medium min-w-[3ch] text-center">{{ qty() }}</span>
                        <button (click)="incrementQty()" class="px-5 py-4 hover:bg-gray-50 text-gray-600 font-medium transition-colors">+</button>
                     </div>
                     
                     <button 
                       (click)="addToCart(p)"
                       class="flex-1 rounded-lg bg-gray-900 px-8 py-4 text-base font-bold text-white shadow-xl hover:bg-gray-800 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 active:scale-95"
                     >
                       Add to Cart
                     </button>
                   </div>
                   
                   <p class="text-sm text-green-700 flex items-center gap-2 bg-green-50 w-fit px-3 py-1 rounded-full">
                     <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
                     {{ p.inventory > 10 ? 'In Stock' : 'Only ' + p.inventory + ' left' }} - ready to ship
                   </p>
                 } @else {
                   <button disabled class="w-full rounded-lg bg-gray-100 px-8 py-4 text-base font-medium text-gray-400 cursor-not-allowed border border-gray-200">
                     Out of Stock
                   </button>
                 }
              </div>
              
              <!-- Accordion Details -->
              <div class="mt-12 border-t border-gray-100">
                <!-- Features -->
                <div class="border-b border-gray-100">
                  <button 
                    (click)="toggleAccordion('features')"
                    class="flex w-full items-center justify-between py-6 text-left text-base font-medium text-gray-900 group"
                  >
                    <span>Features</span>
                    <span class="ml-6 flex items-center text-gray-400 group-hover:text-gray-900 transition-colors text-2xl font-light">
                      {{ openAccordion() === 'features' ? '−' : '+' }}
                    </span>
                  </button>
                  @if (openAccordion() === 'features') {
                    <div class="pb-6 text-gray-600 text-sm leading-relaxed animate-fade-in">
                      <ul class="list-disc pl-5 space-y-2">
                        <li>Premium quality materials</li>
                        <li>Designed for durability and comfort</li>
                        <li>Carefully crafted with attention to detail</li>
                        <li>Versatile design for everyday use</li>
                      </ul>
                    </div>
                  }
                </div>
                
                <!-- Shipping & Returns -->
                <div class="border-b border-gray-100">
                  <button 
                    (click)="toggleAccordion('shipping')"
                    class="flex w-full items-center justify-between py-6 text-left text-base font-medium text-gray-900 group"
                  >
                    <span>Shipping & Returns</span>
                    <span class="ml-6 flex items-center text-gray-400 group-hover:text-gray-900 transition-colors text-2xl font-light">
                      {{ openAccordion() === 'shipping' ? '−' : '+' }}
                    </span>
                  </button>
                  @if (openAccordion() === 'shipping') {
                    <div class="pb-6 text-gray-600 text-sm leading-relaxed animate-fade-in">
                      <p class="mb-3"><strong>Free shipping</strong> on orders over $50</p>
                      <p class="mb-3">Standard delivery: 3-5 business days</p>
                      <p class="mb-3">Express delivery: 1-2 business days (+$15)</p>
                      <p><strong>30-day returns</strong> - Full refund if you're not satisfied</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          
          <!-- Related Products -->
          @if (relatedProducts().length > 0) {
            <div class="mt-32 border-t border-gray-100 pt-16">
              <h2 class="text-3xl font-serif font-bold text-gray-900 mb-12">You may also like</h2>
              <div class="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                @for (item of relatedProducts(); track item.id) {
                  <a [routerLink]="['/product', item.id]" class="group cursor-pointer">
                    <div class="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 relative mb-4 shadow-sm group-hover:shadow-md transition-all">
                      <img [src]="item.imageUrl" [alt]="item.name" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700">
                      @if (item.isNew) {
                        <span class="absolute top-3 left-3 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">NEW</span>
                      }
                    </div>
                    <h3 class="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{{ item.name }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ item.price | currency }}</p>
                  </a>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="flex items-center justify-center min-h-[50vh]">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
            <p class="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
            <a routerLink="/shop" class="text-primary-600 font-medium hover:underline">Browse all products</a>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private db = inject(DbService);
  private cart = inject(CartService);
  private meta = inject(MetaService);
  
  Math = Math;
  
  qty = signal(1);
  selectedColor = signal<string | null>(null);
  selectedSize = signal<string | null>(null);
  selectedImage = signal<string | null>(null);
  openAccordion = signal<string | null>(null);

  product = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return this.db.products().find(p => p.id === id);
  });

  relatedProducts = computed(() => {
    const p = this.product();
    if (!p) return [];
    
    // Get products from same category, excluding current product
    return this.db.products()
      .filter(item => item.category === p.category && item.id !== p.id)
      .slice(0, 4);
  });

  constructor() {
    // Set default selections when product loads
    effect(() => {
      const p = this.product();
      if (p) {
        if (p.colors?.length) this.selectedColor.set(p.colors[0]);
        if (p.sizes?.length) this.selectedSize.set(p.sizes[0]);
        if (p.images?.length) this.selectedImage.set(p.images[0]);
        
        // Update SEO
        this.meta.setProductMeta({
          name: p.name,
          description: p.description,
          price: p.isSale && p.salePrice ? p.salePrice : p.price,
          imageUrl: p.imageUrl,
          sku: p.id,
          availability: p.inventory > 0 ? 'InStock' : 'OutOfStock',
          rating: p.rating,
          reviewCount: p.reviewCount
        });
      }
    });
  }

  incrementQty() {
    this.qty.update(v => v + 1);
  }

  decrementQty() {
    this.qty.update(v => v > 1 ? v - 1 : 1);
  }

  toggleAccordion(section: string) {
    this.openAccordion.update(v => v === section ? null : section);
  }

  getColorName(hex: string): string {
    const colors: Record<string, string> = {
      '#000000': 'Black',
      '#FFFFFF': 'White',
      '#8B4513': 'Brown',
      '#333333': 'Charcoal',
      '#808080': 'Gray',
      '#CCCCCC': 'Silver',
      '#FFB6C1': 'Pink',
      '#556B2F': 'Olive',
      '#C0C0C0': 'Silver',
      '#000080': 'Navy',
      '#D3D3D3': 'Light Gray',
      '#A9A9A9': 'Dark Gray',
      '#F5DEB3': 'Tan',
      '#F5F5DC': 'Beige',
      '#FFD700': 'Gold'
    };
    return colors[hex.toUpperCase()] || hex;
  }

  addToCart(p: Product) {
    for (let i = 0; i < this.qty(); i++) {
      this.cart.addToCart(p);
    }
    this.qty.set(1);
  }
}
