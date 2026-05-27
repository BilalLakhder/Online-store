import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  template: `
    <!-- Top Bar -->
    <div class="bg-primary-900 text-white text-xs py-2 text-center font-medium tracking-wide">
      Free Shipping on Orders Over $50 | 30-Day Returns | Secure Checkout
    </div>

    <nav class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md transition-all duration-300">
      <div class="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2 group">
          @if (theme.theme().logoUrl) {
            <img [src]="theme.theme().logoUrl" [alt]="theme.theme().brandName" class="h-9 w-auto">
          } @else {
            <div class="flex h-9 w-9 items-center justify-center rounded bg-primary-900 text-white transition-transform group-hover:scale-105">
              <span class="font-serif font-bold text-xl">{{ theme.theme().brandName.charAt(0) }}</span>
            </div>
          }
          <span class="text-xl font-bold tracking-tight text-gray-900 font-serif">{{ theme.theme().brandName }}</span>
        </a>

        <!-- Desktop Links - Centered -->
        <div class="hidden md:flex md:gap-x-10">
          <a routerLink="/" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Home</a>
          <a routerLink="/shop" routerLinkActive="text-accent-600 font-semibold" [routerLinkActiveOptions]="{exact: true}" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Shop</a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin" class="text-sm font-medium text-indigo-600 hover:text-indigo-800">Admin</a>
          }
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-5">
           <!-- Search -->
           <button (click)="toggleSearch()" class="text-gray-500 hover:text-gray-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
           </button>
           
           <!-- User -->
           @if (!auth.isLoggedIn()) {
             <a routerLink="/login" class="text-gray-500 hover:text-gray-900 transition-colors" title="Sign in">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
             </a>
           } @else {
             <a routerLink="/account" class="text-gray-500 hover:text-gray-900 transition-colors" title="My Account">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
             </a>
           }

           <!-- Cart Trigger -->
          <button (click)="cart.open()" class="group relative flex items-center outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-800 group-hover:text-accent-600 transition-colors"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            @if (cart.count() > 0) {
              <span class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {{ cart.count() }}
              </span>
            }
          </button>
        </div>
      </div>
      
      <!-- Search Bar (Expandable) -->
      @if (showSearch()) {
        <div class="border-t border-gray-100 bg-white px-4 py-4 animate-fade-in">
          <div class="mx-auto max-w-2xl">
            <form (submit)="search($event)" class="relative">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                name="search"
                placeholder="Search products..."
                class="w-full rounded-full border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm focus:border-primary-500 focus:ring-primary-500 border"
                autofocus
              >
              <div class="absolute inset-y-0 left-0 flex items-center pl-4">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <button 
                type="button" 
                (click)="closeSearch()" 
                class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  private router = inject(Router);
  cart = inject(CartService);
  auth = inject(AuthService);
  theme = inject(ThemeService);
  
  showSearch = signal(false);
  searchQuery = '';

  toggleSearch() {
    this.showSearch.update(v => !v);
    if (!this.showSearch()) {
      this.searchQuery = '';
    }
  }

  closeSearch() {
    this.showSearch.set(false);
    this.searchQuery = '';
  }

  search(event: Event) {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      this.router.navigate(['/shop'], { queryParams: { search: this.searchQuery.trim() } });
      this.closeSearch();
    }
  }
}
