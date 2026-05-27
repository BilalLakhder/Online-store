import { Component, inject, signal, computed, effect } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DbService, Product } from '../../services/db.service';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../ui/product-card.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule, ProductCardComponent],
  template: `
    <div class="bg-white min-h-screen">
      <!-- Breadcrumb & Header -->
      <div class="bg-gray-50 border-b border-gray-200">
         <div class="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">
            <nav class="flex items-center text-sm text-gray-500 mb-6">
               <a routerLink="/" class="hover:text-gray-900 hover:underline">Home</a>
               <span class="mx-2 text-gray-400">/</span>
               <span class="font-medium text-gray-900">Shop</span>
            </nav>
            <div class="text-center">
              <h1 class="text-4xl font-serif font-bold tracking-tight text-gray-900">All Products</h1>
              <p class="mt-4 text-gray-500 max-w-2xl mx-auto text-lg">
                 Explore our collection of premium goods. Filter by category, price, or sort to find exactly what you need.
              </p>
            </div>
         </div>
      </div>

      <!-- Mobile Filter Button (Sticky) -->
      <div class="lg:hidden sticky top-[72px] z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
         <button (click)="showMobileFilters.set(true)" class="flex items-center gap-2 text-sm font-bold text-gray-900">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            Filters
            @if(activeFilterCount() > 0) {
              <span class="bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{{ activeFilterCount() }}</span>
            }
         </button>
         <span class="text-sm text-gray-500">{{ filteredProducts().length }} Results</span>
      </div>

      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex flex-col lg:flex-row gap-12 xl:gap-16">
          
          <!-- Sidebar Filters (Desktop) -->
          <div class="hidden lg:block w-64 flex-shrink-0 space-y-8">
             <!-- Search -->
             <div class="relative">
               <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               </div>
               <input 
                  type="text" 
                  [(ngModel)]="filters.search" 
                  (ngModelChange)="onSearchChange()"
                  placeholder="Search products..."
                  class="block w-full rounded-lg border-gray-200 bg-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-3 pl-10 pr-8 border transition-colors"
                >
                @if (filters.search()) {
                  <button (click)="filters.search.set('')" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                }
             </div>

             <!-- Categories -->
             <div>
               <h3 class="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Categories</h3>
               <div class="space-y-2">
                 <button 
                   (click)="filters.category.set('')"
                   class="flex w-full items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left"
                   [class.bg-gray-100]="filters.category() === ''"
                   [class.font-bold]="filters.category() === ''"
                   [class.text-gray-900]="filters.category() === ''"
                   [class.text-gray-600]="filters.category() !== ''"
                 >
                   <span>All Categories</span>
                   <span class="text-xs text-gray-400">{{ db.products().length }}</span>
                 </button>
                 @for (cat of categories(); track cat.name) {
                   <button 
                     (click)="filters.category.set(cat.name)"
                     class="flex w-full items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left group"
                     [class.bg-gray-100]="filters.category() === cat.name"
                     [class.font-bold]="filters.category() === cat.name"
                     [class.text-gray-900]="filters.category() === cat.name"
                     [class.text-gray-600]="filters.category() !== cat.name"
                     [class.hover:bg-gray-50]="filters.category() !== cat.name"
                   >
                     <span>{{ cat.name }}</span>
                     <span class="text-xs text-gray-400 group-hover:text-gray-500">{{ cat.count }}</span>
                   </button>
                 }
               </div>
             </div>

             <!-- Price Range -->
             <div>
                <div class="flex items-center justify-between mb-4">
                   <h3 class="text-xs font-bold text-gray-900 uppercase tracking-widest">Price Range</h3>
                   <span class="text-xs font-medium text-gray-500">{{ filters.minPrice() | currency:'USD':'symbol':'1.0-0' }} - {{ filters.maxPrice() | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="px-2">
                   <input 
                     type="range" 
                     min="0" 
                     max="1000" 
                     step="10" 
                     [ngModel]="filters.maxPrice()" 
                     (ngModelChange)="filters.maxPrice.set($event)"
                     class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-900 focus:outline-none focus:ring-0"
                   >
                   <div class="flex justify-between mt-2 text-xs text-gray-400 font-medium">
                      <span>$0</span>
                      <span>$1000+</span>
                   </div>
                </div>
             </div>

             <!-- Color Filter -->
             <div>
                <h3 class="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Color</h3>
                <div class="flex flex-wrap gap-3">
                   @for (color of allColors(); track color) {
                      <button 
                        (click)="toggleColor(color)"
                        class="w-8 h-8 rounded-full border border-gray-200 relative shadow-sm hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        [style.background-color]="color"
                        [title]="color"
                      >
                         @if (filters.colors().includes(color)) {
                            <span class="absolute inset-0 flex items-center justify-center">
                               <svg class="w-4 h-4 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </span>
                         }
                      </button>
                   }
                </div>
             </div>

             <!-- Rating Filter -->
             <div>
               <h3 class="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Rating</h3>
               <div class="space-y-2">
                 @for (rating of [4, 3, 2, 1]; track rating) {
                    <label class="flex items-center gap-3 cursor-pointer group">
                       <input 
                         type="checkbox" 
                         [checked]="filters.rating() === rating"
                         (change)="filters.rating.set(filters.rating() === rating ? 0 : rating)"
                         class="rounded border-gray-300 text-primary-900 focus:ring-primary-900 h-4 w-4"
                       >
                       <div class="flex items-center text-sm text-gray-600 group-hover:text-gray-900">
                          <div class="flex text-yellow-400 mr-2">
                             @for (star of [1,2,3,4,5]; track star) {
                                <svg class="w-3.5 h-3.5" [class.text-gray-200]="star > rating" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                             }
                          </div>
                          <span class="font-medium">& Up</span>
                       </div>
                    </label>
                 }
               </div>
             </div>
          </div>

          <!-- Product Grid Area -->
          <div class="flex-1">
             <!-- Control Bar -->
             <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
                <span class="text-sm text-gray-500 font-medium">Showing <span class="text-gray-900 font-bold">{{ filteredProducts().length }}</span> of {{ db.products().length }} products</span>
                
                <div class="flex items-center gap-4 self-end sm:self-auto">
                   <!-- Grid Toggle -->
                   <div class="flex bg-gray-100 p-1 rounded-lg">
                      <button (click)="viewMode.set('grid')" class="p-2 rounded-md transition-all" [class.bg-white]="viewMode() === 'grid'" [class.shadow-sm]="viewMode() === 'grid'" [class.text-gray-900]="viewMode() === 'grid'" [class.text-gray-400]="viewMode() !== 'grid'">
                         <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                      </button>
                      <button (click)="viewMode.set('list')" class="p-2 rounded-md transition-all" [class.bg-white]="viewMode() === 'list'" [class.shadow-sm]="viewMode() === 'list'" [class.text-gray-900]="viewMode() === 'list'" [class.text-gray-400]="viewMode() !== 'list'">
                         <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
                      </button>
                   </div>
                   
                   <!-- Sort -->
                   <div class="relative group">
                     <select 
                        [ngModel]="currentSort()" 
                        (ngModelChange)="currentSort.set($event)"
                        class="appearance-none bg-transparent pl-4 pr-10 py-2.5 text-sm font-bold text-gray-900 border-none focus:ring-0 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                     >
                       <option value="featured">Sort by: Featured</option>
                       <option value="price-asc">Price: Low to High</option>
                       <option value="price-desc">Price: High to Low</option>
                       <option value="newest">Newest Arrivals</option>
                       <option value="rating">Top Rated</option>
                     </select>
                     <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                   </div>
                </div>
             </div>

             <!-- Active Chips -->
             @if (activeFilterCount() > 0) {
               <div class="flex flex-wrap gap-2 mb-8 animate-fade-in">
                  @if (filters.category()) {
                    <button (click)="filters.category.set('')" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                       Category: {{ filters.category() }}
                       <span class="ml-1.5 text-gray-500 font-bold">×</span>
                    </button>
                  }
                  @if (filters.maxPrice() < 1000) {
                     <button (click)="filters.maxPrice.set(1000)" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                       Max Price: {{ filters.maxPrice() | currency:'USD':'symbol':'1.0-0' }}
                       <span class="ml-1.5 text-gray-500 font-bold">×</span>
                    </button>
                  }
                  @for (color of filters.colors(); track color) {
                     <button (click)="toggleColor(color)" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                       <span class="w-2 h-2 rounded-full mr-1.5 border border-gray-300" [style.background-color]="color"></span>
                       Color
                       <span class="ml-1.5 text-gray-500 font-bold">×</span>
                    </button>
                  }
                  @if (filters.rating() > 0) {
                     <button (click)="filters.rating.set(0)" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                       Rating: {{ filters.rating() }}+
                       <span class="ml-1.5 text-gray-500 font-bold">×</span>
                    </button>
                  }
                  <button (click)="resetFilters()" class="inline-flex items-center px-3 py-1 text-xs font-bold text-red-600 hover:text-red-800 underline decoration-red-200 underline-offset-2">
                     Clear All
                  </button>
               </div>
             }

             <!-- Loading State -->
             @if (isLoading()) {
                <div class="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                   @for (i of [1,2,3,4,5,6]; track i) {
                      <div class="animate-pulse">
                         <div class="bg-gray-200 aspect-[3/4] rounded-lg mb-4"></div>
                         <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                         <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                   }
                </div>
             } @else {
                <!-- Products -->
                @if (filteredProducts().length > 0) {
                   <div [class]="viewMode() === 'grid' ? 'grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-6'">
                    @for (product of filteredProducts(); track product.id) {
                       <!-- Grid Item -->
                       @if (viewMode() === 'grid') {
                         <app-product-card [product]="product" />
                       } @else {
                         <!-- List Item (Inline) -->
                         <div class="flex gap-6 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all group bg-white">
                            <div class="w-48 aspect-[3/4] flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                               <img [src]="product.imageUrl" class="w-full h-full object-cover">
                               @if(product.isNew) { <span class="absolute top-2 left-2 bg-gray-900 text-white text-[10px] px-2 py-1 font-bold rounded">NEW</span> }
                            </div>
                            <div class="flex-1 py-2">
                               <div class="flex justify-between items-start">
                                  <div>
                                     <p class="text-sm text-gray-500 mb-1">{{ product.category }}</p>
                                     <h3 class="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                        <a [routerLink]="['/product', product.id]">{{ product.name }}</a>
                                     </h3>
                                     <div class="flex text-yellow-400 text-sm mb-4">
                                        @for(star of [1,2,3,4,5]; track star) { <svg class="w-4 h-4" [attr.fill]="star <= product.rating ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> }
                                        <span class="text-gray-400 ml-2">({{product.reviewCount}})</span>
                                     </div>
                                     <p class="text-gray-600 line-clamp-2 mb-4">{{ product.description }}</p>
                                  </div>
                                  <div class="text-right">
                                     <p class="text-xl font-bold text-gray-900">{{ product.price | currency }}</p>
                                  </div>
                               </div>
                               <div class="mt-auto pt-4 border-t border-gray-100">
                                  <a [routerLink]="['/product', product.id]" class="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors">View Details</a>
                               </div>
                            </div>
                         </div>
                       }
                    }
                   </div>
                } @else {
                  <div class="text-center py-32 bg-gray-50 rounded-xl border border-dashed border-gray-300 animate-fade-in">
                     <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                     </div>
                    <h3 class="text-lg font-bold text-gray-900">No products found</h3>
                    <p class="mt-2 text-gray-500 mb-8">Try adjusting your filters or search terms.</p>
                    <button (click)="resetFilters()" class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-full shadow-lg text-white bg-gray-900 hover:bg-gray-800 transition-all hover:scale-105">
                      Clear All Filters
                    </button>
                    
                    <!-- Popular Suggestions -->
                    <div class="mt-12 pt-8 border-t border-gray-200 w-full max-w-lg mx-auto">
                       <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Popular Categories</p>
                       <div class="flex justify-center gap-3 flex-wrap">
                          <button (click)="resetFilters(); filters.category.set('Electronics')" class="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-gray-900 transition-colors">Electronics</button>
                          <button (click)="resetFilters(); filters.category.set('Furniture')" class="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-gray-900 transition-colors">Furniture</button>
                          <button (click)="resetFilters(); filters.category.set('Accessories')" class="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-gray-900 transition-colors">Accessories</button>
                       </div>
                    </div>
                  </div>
                }
             }
             
             <!-- Results Count -->
             @if (filteredProducts().length > 0 && !isLoading()) {
                <div class="mt-12 text-center text-sm text-gray-500">
                   Showing all {{ filteredProducts().length }} products
                </div>
             }
          </div>
        </div>
      </div>

      <!-- Mobile Filter Drawer -->
      @if (showMobileFilters()) {
         <div class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" (click)="showMobileFilters.set(false)"></div>
            <div class="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-xl py-6 flex flex-col animate-slide-in-right">
               <div class="px-6 flex items-center justify-between mb-6">
                  <h2 class="text-lg font-bold text-gray-900">Filters</h2>
                  <button (click)="showMobileFilters.set(false)" class="p-2 text-gray-400 hover:text-gray-500">
                     <span class="sr-only">Close menu</span>
                     <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
               
               <div class="flex-1 px-6 overflow-y-auto space-y-8">
                  <!-- Reuse filter blocks here (simplified for mobile) -->
                  <div>
                     <h3 class="font-bold text-gray-900 mb-4">Price Range</h3>
                     <input type="range" min="0" max="1000" step="10" [ngModel]="filters.maxPrice()" (ngModelChange)="filters.maxPrice.set($event)" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900">
                     <div class="mt-2 text-sm text-gray-600">Max: {{ filters.maxPrice() | currency }}</div>
                  </div>
                  
                  <div>
                     <h3 class="font-bold text-gray-900 mb-4">Categories</h3>
                     <div class="space-y-3">
                        <button (click)="filters.category.set('')" class="block w-full text-left text-sm" [class.font-bold]="filters.category() === ''">All Categories</button>
                        @for (cat of categories(); track cat.name) {
                           <button (click)="filters.category.set(cat.name)" class="block w-full text-left text-sm" [class.font-bold]="filters.category() === cat.name">{{ cat.name }}</button>
                        }
                     </div>
                  </div>
               </div>
               
               <div class="px-6 pt-6 border-t border-gray-200">
                  <button (click)="showMobileFilters.set(false)" class="w-full bg-gray-900 text-white font-bold py-3 rounded-lg shadow-lg">Show Results</button>
                  <button (click)="resetFilters()" class="w-full text-center text-sm font-medium text-gray-500 mt-4 underline">Reset Filters</button>
               </div>
            </div>
         </div>
      }
    </div>
  `
})
export class ShopComponent {
  db = inject(DbService);
  route = inject(ActivatedRoute);
  
  // State
  isLoading = signal(false);
  showMobileFilters = signal(false);
  viewMode = signal<'grid' | 'list'>('grid');
  currentSort = signal('featured');

  // Filters State
  filters = {
    search: signal(''),
    category: signal(''),
    minPrice: signal(0),
    maxPrice: signal(1000),
    colors: signal<string[]>([]),
    rating: signal(0)
  };

  constructor() {
    // Simulate loading on filter change (debounce/effect pattern mock)
    effect(() => {
      // Access signals to trigger effect
      this.filters.search();
      this.filters.category();
      this.filters.maxPrice();
      this.filters.colors();
      this.filters.rating();
      this.currentSort();

      this.isLoading.set(true);
      setTimeout(() => this.isLoading.set(false), 400); // 400ms fake load
    }, { allowSignalWrites: true });

    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        if (params['category'] === 'New') {
           this.currentSort.set('newest');
        } else if (params['category'] === 'Sale') {
           // Should ideally filter by isSale but leveraging existing simple filters for now
           // For this demo we just set the sort if simple category matches
        } else {
          this.filters.category.set(params['category']);
        }
      }
    });
  }

  // Derived Data
  categories = computed(() => {
    const products = this.db.products();
    const map = new Map<string, number>();
    products.forEach(p => {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
  });

  allColors = computed(() => {
    const set = new Set<string>();
    this.db.products().forEach(p => {
      if (p.colors) p.colors.forEach(c => set.add(c));
    });
    return Array.from(set);
  });

  filteredProducts = computed(() => {
    let products = this.db.products();
    const q = this.filters.search().toLowerCase();
    const cat = this.filters.category();
    const maxP = this.filters.maxPrice();
    const colors = this.filters.colors();
    const minRating = this.filters.rating();

    // Filtering
    if (cat) products = products.filter(p => p.category === cat);
    if (q) products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    if (maxP < 1000) products = products.filter(p => p.price <= maxP);
    if (colors.length > 0) products = products.filter(p => p.colors && p.colors.some(c => colors.includes(c)));
    if (minRating > 0) products = products.filter(p => p.rating >= minRating);

    // Sorting
    const sort = this.currentSort();
    return [...products].sort((a, b) => {
      switch (sort) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest': return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'rating': return b.rating - a.rating;
        default: return 0; // featured
      }
    });
  });

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filters.category()) count++;
    if (this.filters.search()) count++;
    if (this.filters.maxPrice() < 1000) count++;
    if (this.filters.colors().length > 0) count++;
    if (this.filters.rating() > 0) count++;
    return count;
  });

  // Actions
  onSearchChange() {
    // In a real app, you'd debounce this
  }

  toggleColor(color: string) {
    this.filters.colors.update(colors => {
      return colors.includes(color) 
        ? colors.filter(c => c !== color) 
        : [...colors, color];
    });
  }

  resetFilters() {
    this.filters.search.set('');
    this.filters.category.set('');
    this.filters.maxPrice.set(1000);
    this.filters.colors.set([]);
    this.filters.rating.set(0);
    this.currentSort.set('featured');
  }
}