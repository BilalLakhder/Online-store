import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/ui/navbar.component';
import { CartDrawerComponent } from './components/ui/cart-drawer.component';
import { FooterComponent } from './components/ui/footer.component';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CartDrawerComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-white flex flex-col font-sans">
      @if (!hideNavbar) {
        <app-navbar />
        <app-cart-drawer />
      }
      
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      @if (!hideFooter) {
        <app-footer />
      }
    </div>
  `
})
export class AppComponent {
  hideNavbar = false;
  hideFooter = false;

  constructor(private router: Router, private viewportScroller: ViewportScroller) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const url = this.router.url;
      
      // Hide navbar/footer on admin and checkout pages
      this.hideNavbar = url.includes('/admin') || url.includes('/checkout');
      this.hideFooter = url.includes('/admin') || url.includes('/checkout');
      
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }
}
