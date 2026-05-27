import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home.component';
import { ShopComponent } from './components/pages/shop.component';
import { ProductDetailComponent } from './components/pages/product-detail.component';
import { CartComponent } from './components/pages/cart.component';
import { CheckoutComponent } from './components/pages/checkout.component';
import { LoginComponent } from './components/auth/login.component';
import { AccountComponent } from './components/pages/account.component';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { DashboardComponent } from './components/admin/dashboard.component';
import { ProductsAdminComponent } from './components/admin/products-admin.component';
import { OrdersAdminComponent } from './components/admin/orders-admin.component';
import { CustomersAdminComponent } from './components/admin/customers-admin.component';
// Analytics removed - using dashboard for key metrics
import { SettingsAdminComponent } from './components/admin/settings-admin.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SupabaseService } from './services/supabase.service';

const adminGuard = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  
  // Wait for auth initialization if not ready
  if (!supabase.isInitialized()) {
    await new Promise<void>(resolve => {
      const checkInit = setInterval(() => {
        if (supabase.isInitialized()) {
          clearInterval(checkInit);
          resolve();
        }
      }, 50);
      // Timeout after 3 seconds
      setTimeout(() => {
        clearInterval(checkInit);
        resolve();
      }, 3000);
    });
  }
  
  if (supabase.isAdmin()) {
    return true;
  }
  
  // Not admin - redirect to login
  router.navigate(['/login']);
  return false;
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'account', component: AccountComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductsAdminComponent },
      { path: 'orders', component: OrdersAdminComponent },
      { path: 'customers', component: CustomersAdminComponent },
      { path: 'settings', component: SettingsAdminComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];