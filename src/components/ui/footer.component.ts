import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-gray-900 text-white">
      <!-- Main Footer -->
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <!-- Brand Column -->
          <div class="lg:col-span-1">
            <a routerLink="/" class="flex items-center gap-2 mb-6">
              @if (theme.theme().logoUrl) {
                <img [src]="theme.theme().logoUrl" [alt]="theme.theme().brandName" class="h-8 w-auto brightness-0 invert">
              } @else {
                <div class="flex h-8 w-8 items-center justify-center rounded bg-white text-gray-900">
                  <span class="font-serif font-bold text-lg">{{ theme.theme().brandName.charAt(0) }}</span>
                </div>
              }
              <span class="text-xl font-bold tracking-tight font-serif">{{ theme.theme().brandName }}</span>
            </a>
            <p class="text-gray-400 text-sm leading-relaxed mb-6">
              Premium goods for modern living. Curated with care, delivered with love.
            </p>
            
            <!-- Social Links -->
            <div class="flex gap-4">
              @if (theme.theme().socialLinks?.instagram) {
                <a [href]="theme.theme().socialLinks.instagram" target="_blank" class="text-gray-400 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              }
              @if (theme.theme().socialLinks?.twitter) {
                <a [href]="theme.theme().socialLinks.twitter" target="_blank" class="text-gray-400 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              }
              @if (theme.theme().socialLinks?.facebook) {
                <a [href]="theme.theme().socialLinks.facebook" target="_blank" class="text-gray-400 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              }
              @if (theme.theme().socialLinks?.linkedin) {
                <a [href]="theme.theme().socialLinks.linkedin" target="_blank" class="text-gray-400 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              }
            </div>
          </div>

          <!-- Shop Column -->
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider mb-6">Shop</h3>
            <ul class="space-y-3">
              <li><a routerLink="/shop" class="text-gray-400 hover:text-white transition-colors text-sm">All Products</a></li>
              <li><a routerLink="/shop" [queryParams]="{category: 'Electronics'}" class="text-gray-400 hover:text-white transition-colors text-sm">Electronics</a></li>
              <li><a routerLink="/shop" [queryParams]="{category: 'Furniture'}" class="text-gray-400 hover:text-white transition-colors text-sm">Furniture</a></li>
              <li><a routerLink="/shop" [queryParams]="{category: 'Accessories'}" class="text-gray-400 hover:text-white transition-colors text-sm">Accessories</a></li>
              <li><a routerLink="/shop" [queryParams]="{category: 'Lifestyle'}" class="text-gray-400 hover:text-white transition-colors text-sm">Lifestyle</a></li>
            </ul>
          </div>

          <!-- Company Column -->
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider mb-6">Company</h3>
            <ul class="space-y-3">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Careers</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Press</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Blog</a></li>
            </ul>
          </div>

          <!-- Support Column -->
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider mb-6">Support</h3>
            <ul class="space-y-3">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Help Center</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Shipping Info</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Returns & Exchanges</a></li>
              <li><a [href]="'mailto:' + theme.theme().supportEmail" class="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</a></li>
            </ul>
            
            @if (theme.theme().supportEmail) {
              <div class="mt-6 pt-6 border-t border-gray-800">
                <p class="text-xs text-gray-500 mb-2">Need help?</p>
                <a [href]="'mailto:' + theme.theme().supportEmail" class="text-sm font-medium text-white hover:text-accent-400 transition-colors">
                  {{ theme.theme().supportEmail }}
                </a>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-800">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-sm text-gray-500">
              {{ theme.theme().footerText }}
            </p>
            <div class="flex flex-wrap justify-center gap-6">
              <a href="#" class="text-xs text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" class="text-xs text-gray-500 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" class="text-xs text-gray-500 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
          
          <!-- Payment Methods -->
          <div class="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-800">
            <div class="h-6 w-10 bg-gray-700 rounded flex items-center justify-center text-[8px] font-bold text-gray-400">VISA</div>
            <div class="h-6 w-10 bg-gray-700 rounded flex items-center justify-center text-[8px] font-bold text-gray-400">MC</div>
            <div class="h-6 w-10 bg-gray-700 rounded flex items-center justify-center text-[8px] font-bold text-gray-400">AMEX</div>
            <div class="h-6 w-10 bg-gray-700 rounded flex items-center justify-center text-[8px] font-bold text-gray-400">PAYPAL</div>
            <div class="h-6 w-10 bg-gray-700 rounded flex items-center justify-center text-[8px] font-bold text-gray-400">APPLE</div>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  theme = inject(ThemeService);
}
