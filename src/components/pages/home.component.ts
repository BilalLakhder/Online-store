import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DbService } from '../../services/db.service';
import { ProductCardComponent } from '../ui/product-card.component';
import { ContentService } from '../../services/content.service';
import { ThemeService } from '../../services/theme.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, FormsModule],
  template: `
    <!-- ANNOUNCEMENT BAR -->
    @if (content.announcement().enabled) {
      <div 
        class="text-center py-2.5 px-4 text-sm font-medium"
        [style.backgroundColor]="content.announcement().backgroundColor"
        [style.color]="content.announcement().textColor"
      >
        @if (content.announcement().link) {
          <a [routerLink]="content.announcement().link" class="hover:underline">
            {{ content.announcement().message }}
          </a>
        } @else {
          {{ content.announcement().message }}
        }
      </div>
    }

    <!-- SECTION 1: HERO (Dynamic) -->
    <div class="relative h-[90vh] w-full overflow-hidden bg-gray-900">
      <!-- Background Image -->
      <img 
        [src]="content.hero().backgroundImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000'" 
        alt="Hero background" 
        class="absolute inset-0 h-full w-full object-cover animate-fade-in"
        [style.opacity]="1 - (content.hero().overlayOpacity || 0.4)"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
      
      <!-- Content -->
      <div class="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <span class="mb-6 inline-block rounded-full bg-white/10 px-6 py-2 text-sm font-medium text-white backdrop-blur-md border border-white/20 animate-slide-up">
          New Collection 2024
        </span>
        <h1 class="mb-8 max-w-5xl font-serif text-5xl font-bold tracking-tight text-white sm:text-7xl animate-slide-up" style="animation-delay: 100ms">
          {{ content.hero().headline }}
        </h1>
        <p class="mb-12 max-w-2xl text-lg text-gray-200 sm:text-xl animate-slide-up" style="animation-delay: 200ms">
          {{ content.hero().subheadline }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 animate-slide-up" style="animation-delay: 300ms">
          <a [routerLink]="content.hero().ctaLink" class="rounded-full bg-white px-10 py-4 text-base font-semibold text-gray-900 shadow-xl hover:bg-gray-100 hover:scale-105 transition-all">
            {{ content.hero().ctaText }}
          </a>
          <a routerLink="/shop" class="rounded-full border border-white/30 bg-transparent px-10 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors">
            Explore Catalog
          </a>
        </div>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
      </div>
    </div>

    <!-- SECTION 2: TRUST BAR -->
    <div class="border-b border-gray-100 bg-white shadow-sm relative z-20">
      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div class="flex flex-col items-center text-center group">
            <span class="mb-3 text-3xl group-hover:scale-110 transition-transform">🚚</span>
            <span class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Free Shipping</span>
            <span class="text-xs text-gray-500 mt-1">On all orders over $50</span>
          </div>
          <div class="flex flex-col items-center text-center group">
            <span class="mb-3 text-3xl group-hover:scale-110 transition-transform">↺</span>
            <span class="text-sm font-semibold text-gray-900 uppercase tracking-wide">30-Day Returns</span>
            <span class="text-xs text-gray-500 mt-1">Money back guarantee</span>
          </div>
          <div class="flex flex-col items-center text-center group">
             <span class="mb-3 text-3xl group-hover:scale-110 transition-transform">🔒</span>
            <span class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Secure Checkout</span>
            <span class="text-xs text-gray-500 mt-1">100% protected payments</span>
          </div>
          <div class="flex flex-col items-center text-center group">
            <span class="mb-3 text-3xl group-hover:scale-110 transition-transform">★</span>
            <span class="text-sm font-semibold text-gray-900 uppercase tracking-wide">10k+ Reviews</span>
            <span class="text-xs text-gray-500 mt-1">Trusted by customers</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 3: FEATURED PRODUCTS -->
    <section class="py-28 bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
           <div>
             <span class="text-accent-500 font-bold tracking-widest text-xs uppercase mb-2 block">Curated Selection</span>
             <h2 class="text-4xl font-serif font-bold text-gray-900">Featured This Season</h2>
           </div>
           <a routerLink="/shop" class="group flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-accent-600 transition-colors">
             View All Products <span aria-hidden="true" class="group-hover:translate-x-1 transition-transform">&rarr;</span>
           </a>
        </div>
        
        <div class="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          @for (product of featuredProducts(); track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      </div>
    </section>

    <!-- SECTION 4: SPLIT CONTENT (Storytelling) -->
    <section class="bg-primary-50">
      <div class="flex flex-col lg:flex-row h-auto lg:h-[700px]">
        <div class="lg:w-1/2 relative h-[500px] lg:h-full overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1600" 
            alt="Interior design" 
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
          >
        </div>
        <div class="lg:w-1/2 flex items-center justify-center p-12 lg:p-32 bg-primary-900 text-white">
          <div class="max-w-md">
            <span class="text-accent-500 font-bold tracking-widest text-xs uppercase mb-6 block">Our Philosophy</span>
            <h2 class="text-4xl md:text-5xl font-serif font-bold mb-8 leading-tight">Quality over quantity, always.</h2>
            <p class="text-gray-300 mb-10 leading-relaxed text-lg">
              We believe in owning fewer, better things. Each item in our collection is selected for its craftsmanship, durability, and timeless design. We partner with artisans who care about the details as much as we do.
            </p>
            <a routerLink="/shop" class="inline-block border-b-2 border-white pb-1 font-medium hover:text-accent-500 hover:border-accent-500 transition-colors">
              Read Our Story
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 5: CATEGORIES -->
    <section class="py-28 bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="text-4xl font-serif font-bold text-gray-900 mb-16 text-center">Shop by Category</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
           <!-- Electronics -->
           <a routerLink="/shop" [queryParams]="{category: 'Electronics'}" class="group relative h-[500px] overflow-hidden rounded-xl shadow-lg">
             <img src="https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&q=80&w=800" alt="Electronics" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110">
             <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
             <div class="absolute bottom-8 left-8">
               <h3 class="text-3xl font-bold text-white mb-2">Electronics</h3>
               <span class="text-white/90 text-sm font-medium group-hover:translate-x-2 transition-transform inline-block">View Collection &rarr;</span>
             </div>
           </a>
           
           <!-- Furniture -->
           <a routerLink="/shop" [queryParams]="{category: 'Furniture'}" class="group relative h-[500px] overflow-hidden rounded-xl shadow-lg">
             <img src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=800" alt="Furniture" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110">
             <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
             <div class="absolute bottom-8 left-8">
               <h3 class="text-3xl font-bold text-white mb-2">Furniture</h3>
               <span class="text-white/90 text-sm font-medium group-hover:translate-x-2 transition-transform inline-block">View Collection &rarr;</span>
             </div>
           </a>

           <!-- Accessories -->
           <a routerLink="/shop" [queryParams]="{category: 'Accessories'}" class="group relative h-[500px] overflow-hidden rounded-xl shadow-lg">
             <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800" alt="Accessories" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110">
             <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
             <div class="absolute bottom-8 left-8">
               <h3 class="text-3xl font-bold text-white mb-2">Accessories</h3>
               <span class="text-white/90 text-sm font-medium group-hover:translate-x-2 transition-transform inline-block">View Collection &rarr;</span>
             </div>
           </a>
        </div>
      </div>
    </section>
    
    <!-- SECTION 6: BESTSELLERS -->
    <section class="py-28 bg-gray-50">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
           <div>
             <span class="text-accent-500 font-bold tracking-widest text-xs uppercase mb-2 block">Most Popular</span>
             <h2 class="text-4xl font-serif font-bold text-gray-900">Bestsellers</h2>
           </div>
           <a routerLink="/shop" class="group flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-accent-600 transition-colors">
             View All Products <span aria-hidden="true" class="group-hover:translate-x-1 transition-transform">&rarr;</span>
           </a>
        </div>
        <div class="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          @for (product of bestSellers(); track product.id) {
             <app-product-card [product]="product" />
          }
        </div>
      </div>
    </section>

    <!-- SECTION 7: PROMO BANNER -->
    <section class="bg-accent-600 py-32 relative overflow-hidden">
       <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
       <div class="max-w-4xl mx-auto text-center relative z-10 px-4">
         <span class="text-white/90 font-bold tracking-widest uppercase text-sm mb-6 block bg-white/10 inline-block px-4 py-1 rounded-full backdrop-blur-sm">Limited Time Offer</span>
         <h2 class="text-5xl md:text-6xl font-serif font-bold text-white mb-8">Free Shipping on Orders Over $50</h2>
         <p class="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">Upgrade your lifestyle with premium goods. Fast shipping, easy returns, and exceptional customer service included.</p>
         <a routerLink="/shop" class="inline-block bg-white text-accent-600 px-12 py-5 rounded-full font-bold shadow-2xl hover:bg-gray-100 transition-transform hover:scale-105 active:scale-95">
           Shop Now
         </a>
       </div>
    </section>
    
    <!-- SECTION 8: TESTIMONIALS -->
    <section class="py-28 bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="text-4xl font-serif font-bold text-center text-gray-900 mb-20">Loved by Thousands</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-gray-50 p-10 rounded-2xl relative hover:shadow-lg transition-shadow duration-300">
            <div class="text-yellow-400 flex mb-6 text-xl">★★★★★</div>
            <p class="text-gray-700 italic mb-8 text-lg leading-relaxed">"The quality of the leather bag I purchased is absolutely incredible. It looks even better in person than on the site. Shipping was super fast too!"</p>
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 bg-gray-300 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" class="h-full w-full object-cover">
              </div>
              <div>
                <p class="font-bold text-gray-900">Sarah Jenkins</p>
                <p class="text-xs text-gray-500 uppercase tracking-wide">New York, NY</p>
              </div>
            </div>
          </div>
          
           <div class="bg-gray-50 p-10 rounded-2xl relative hover:shadow-lg transition-shadow duration-300">
            <div class="text-yellow-400 flex mb-6 text-xl">★★★★★</div>
            <p class="text-gray-700 italic mb-8 text-lg leading-relaxed">"Finally found a store that curates actually good products. The minimalist aesthetic matches my home perfectly. Will definitely be ordering again."</p>
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 bg-gray-300 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User" class="h-full w-full object-cover">
              </div>
              <div>
                <p class="font-bold text-gray-900">Michael Chen</p>
                <p class="text-xs text-gray-500 uppercase tracking-wide">San Francisco, CA</p>
              </div>
            </div>
          </div>
          
           <div class="bg-gray-50 p-10 rounded-2xl relative hover:shadow-lg transition-shadow duration-300">
            <div class="text-yellow-400 flex mb-6 text-xl">★★★★★</div>
            <p class="text-gray-700 italic mb-8 text-lg leading-relaxed">"Customer support went above and beyond when I needed to exchange for a different size. The process was seamless. Highly recommended!"</p>
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 bg-gray-300 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                <img src="https://i.pravatar.cc/150?u=a04258114e29026302d" alt="User" class="h-full w-full object-cover">
              </div>
              <div>
                <p class="font-bold text-gray-900">Emma Wilson</p>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Austin, TX</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 9: NEWSLETTER -->
    <section class="py-24 bg-gray-900 text-white border-t border-gray-800">
      <div class="mx-auto max-w-4xl px-4 text-center">
        <h2 class="text-4xl font-serif font-bold mb-6">Stay in the Loop</h2>
        <p class="text-gray-400 mb-10 text-lg">Get early access to new products, exclusive offers, and design inspiration.</p>
        <form (submit)="subscribeNewsletter($event)" class="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input 
            type="email" 
            [(ngModel)]="newsletterEmail"
            name="email"
            placeholder="Enter your email" 
            required
            class="flex-1 rounded-full bg-gray-800 border-gray-700 text-white px-6 py-4 focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500"
          >
          <button 
            type="submit" 
            [disabled]="isSubscribing()"
            class="bg-white text-gray-900 font-bold px-10 py-4 rounded-full hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50"
          >
            {{ isSubscribing() ? 'Subscribing...' : 'Subscribe' }}
          </button>
        </form>
        @if (subscribeMessage()) {
          <p class="text-sm mt-4 text-green-400 animate-fade-in">{{ subscribeMessage() }}</p>
        }
        @if (subscribeError()) {
          <p class="text-sm mt-4 text-red-400 animate-fade-in">{{ subscribeError() }}</p>
        }
        <p class="text-xs text-gray-500 mt-6">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  `
})
export class HomeComponent {
  private db = inject(DbService);
  private supabase = inject(SupabaseService);
  content = inject(ContentService);
  theme = inject(ThemeService);
  
  newsletterEmail = '';
  isSubscribing = signal(false);
  subscribeMessage = signal<string | null>(null);
  subscribeError = signal<string | null>(null);
  
  featuredProducts = computed(() => {
    const products = this.db.products();
    const featuredSection = this.content.sections().find(s => s.id === 'featured-products');
    if (featuredSection?.productIds?.length) {
      return products.filter(p => featuredSection.productIds!.includes(p.id)).slice(0, 4);
    }
    return products.filter(p => p.isNew).slice(0, 4).length ? products.filter(p => p.isNew).slice(0, 4) : products.slice(0, 4);
  });

  bestSellers = computed(() => {
    const products = this.db.products();
    return [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
  });

  async subscribeNewsletter(event: Event) {
    event.preventDefault();
    if (!this.newsletterEmail || !this.validateEmail(this.newsletterEmail)) {
      this.subscribeError.set('Please enter a valid email address');
      return;
    }
    
    this.isSubscribing.set(true);
    this.subscribeError.set(null);
    
    const { success, error } = await this.supabase.subscribeNewsletter(this.newsletterEmail);
    
    if (success) {
      this.subscribeMessage.set(`Thanks! We'll send updates to ${this.newsletterEmail}`);
      this.newsletterEmail = '';
      
      // Clear message after 5 seconds
      setTimeout(() => this.subscribeMessage.set(null), 5000);
    } else {
      this.subscribeError.set('Something went wrong. Please try again.');
      console.error('Newsletter subscription error:', error);
    }
    
    this.isSubscribing.set(false);
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
