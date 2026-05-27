import { Component, inject, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DbService, Order } from '../../services/db.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="bg-gray-50 min-h-screen">
      <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">My Account</h1>
          <p class="text-gray-500 mt-1">Manage your profile and view your orders</p>
        </div>

        @if (!auth.isLoggedIn()) {
          <!-- Not Logged In State -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-2">Sign in to view your account</h2>
            <p class="text-gray-500 mb-8 max-w-sm mx-auto">Track your orders, save your details, and enjoy a faster checkout experience.</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a routerLink="/login" class="px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
                Sign In
              </a>
              <a routerLink="/login" class="px-8 py-3 border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-colors">
                Create Account
              </a>
            </div>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Sidebar - Profile Card -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <!-- Avatar & Info -->
                <div class="text-center mb-6 pb-6 border-b border-gray-100">
                  <div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {{ userInitials() }}
                  </div>
                  <h2 class="text-lg font-bold text-gray-900">{{ userProfile()?.fullName || userProfile()?.email }}</h2>
                  <p class="text-sm text-gray-500">{{ userProfile()?.email }}</p>
                  @if (auth.isAdmin()) {
                    <span class="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">Admin</span>
                  }
                </div>
                
                <!-- Quick Stats -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div class="text-center p-3 bg-gray-50 rounded-xl">
                    <p class="text-2xl font-bold text-gray-900">{{ userOrders().length }}</p>
                    <p class="text-xs text-gray-500">Orders</p>
                  </div>
                  <div class="text-center p-3 bg-gray-50 rounded-xl">
                    <p class="text-2xl font-bold text-gray-900">{{ totalSpent() | currency:'USD':'symbol':'1.0-0' }}</p>
                    <p class="text-xs text-gray-500">Total Spent</p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="space-y-2">
                  @if (auth.isAdmin()) {
                    <a routerLink="/admin" class="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      Admin Dashboard
                    </a>
                  }
                  <button (click)="logout()" class="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            <!-- Main Content - Orders -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- Tabs -->
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="border-b border-gray-100">
                  <nav class="flex">
                    <button 
                      (click)="activeTab.set('orders')"
                      class="flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 transition-colors"
                      [class]="activeTab() === 'orders' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    >
                      Order History
                    </button>
                    <button 
                      (click)="activeTab.set('settings')"
                      class="flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 transition-colors"
                      [class]="activeTab() === 'settings' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    >
                      Settings
                    </button>
                  </nav>
                </div>

                @if (activeTab() === 'orders') {
                  <div class="p-6">
                    @if (userOrders().length === 0) {
                      <div class="text-center py-12">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                          </svg>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                        <p class="text-gray-500 mb-6">When you place an order, it will appear here.</p>
                        <a routerLink="/shop" class="inline-block px-6 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
                          Start Shopping
                        </a>
                      </div>
                    } @else {
                      <div class="space-y-4">
                        @for (order of userOrders(); track order.id) {
                          <div class="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
                            <!-- Order Header -->
                            <div class="bg-gray-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                              <div class="flex items-center gap-4">
                                <div>
                                  <p class="text-xs text-gray-500">Order ID</p>
                                  <p class="font-mono font-bold text-gray-900 text-sm">#{{ order.id.slice(0, 8).toUpperCase() }}</p>
                                </div>
                                <div class="hidden sm:block">
                                  <p class="text-xs text-gray-500">Date</p>
                                  <p class="text-sm text-gray-900">{{ order.date | date:'mediumDate' }}</p>
                                </div>
                              </div>
                              <div class="flex items-center gap-3">
                                <span 
                                  class="px-3 py-1 rounded-full text-xs font-bold"
                                  [class]="order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                           order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                           order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                                           'bg-orange-100 text-orange-800'"
                                >
                                  {{ order.status | titlecase }}
                                </span>
                              </div>
                            </div>
                            
                            <!-- Order Items -->
                            <div class="p-4">
                              <div class="flex flex-wrap gap-3 mb-4">
                                @for (item of order.items.slice(0, 4); track item.id) {
                                  <div class="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-100">
                                    <img [src]="item.imageUrl" [alt]="item.name" class="h-full w-full object-cover">
                                  </div>
                                }
                                @if (order.items.length > 4) {
                                  <div class="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                                    +{{ order.items.length - 4 }}
                                  </div>
                                }
                              </div>
                              
                              <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div>
                                  <span class="text-sm text-gray-500">{{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'items' }}</span>
                                </div>
                                <div class="flex items-center gap-4">
                                  <span class="font-bold text-gray-900">{{ order.total | currency }}</span>
                                  <button (click)="viewOrder(order)" class="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <!-- Settings Tab -->
                  <div class="p-6 space-y-6">
                    <div>
                      <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Account Information</h3>
                      <div class="space-y-4">
                        <div class="flex items-center justify-between py-3 border-b border-gray-100">
                          <div>
                            <p class="text-sm font-medium text-gray-900">Email</p>
                            <p class="text-sm text-gray-500">{{ userProfile()?.email }}</p>
                          </div>
                        </div>
                        <div class="flex items-center justify-between py-3 border-b border-gray-100">
                          <div>
                            <p class="text-sm font-medium text-gray-900">Full Name</p>
                            <p class="text-sm text-gray-500">{{ userProfile()?.fullName || 'Not set' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Security</h3>
                      <button class="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        Change Password
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Order Detail Modal -->
    @if (selectedOrder()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" (click)="selectedOrder.set(null)"></div>
          
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <!-- Header -->
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 class="font-bold text-gray-900">Order Details</h2>
                <p class="text-sm text-gray-500 font-mono">#{{ selectedOrder()!.id.slice(0, 8).toUpperCase() }}</p>
              </div>
              <button (click)="selectedOrder.set(null)" class="text-gray-400 hover:text-gray-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <!-- Content -->
            <div class="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <!-- Status -->
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full flex items-center justify-center"
                  [class]="selectedOrder()!.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                           selectedOrder()!.status === 'shipped' ? 'bg-purple-100 text-purple-600' :
                           selectedOrder()!.status === 'processing' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                </div>
                <div>
                  <p class="font-bold text-gray-900 capitalize">{{ selectedOrder()!.status }}</p>
                  <p class="text-sm text-gray-500">{{ selectedOrder()!.date | date:'medium' }}</p>
                </div>
              </div>

              <!-- Items -->
              <div>
                <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Items</h3>
                <div class="space-y-3">
                  @for (item of selectedOrder()!.items; track item.id) {
                    <div class="flex gap-3">
                      <div class="h-14 w-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img [src]="item.imageUrl" [alt]="item.name" class="h-full w-full object-cover">
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-900 text-sm truncate">{{ item.name }}</p>
                        <p class="text-xs text-gray-500">Qty: {{ item.quantity }}</p>
                      </div>
                      <p class="font-medium text-gray-900 text-sm">{{ (item.salePrice || item.price) * item.quantity | currency }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Shipping -->
              @if (selectedOrder()!.shippingAddress) {
                <div>
                  <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h3>
                  <p class="text-sm text-gray-700">{{ selectedOrder()!.shippingAddress }}</p>
                </div>
              }
            </div>
            
            <!-- Footer -->
            <div class="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">Total</span>
                <span class="text-lg font-bold text-gray-900">{{ selectedOrder()!.total | currency }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class AccountComponent {
  private router = inject(Router);
  auth = inject(AuthService);
  private db = inject(DbService);
  private supabase = inject(SupabaseService);

  activeTab = signal<'orders' | 'settings'>('orders');
  selectedOrder = signal<Order | null>(null);

  userProfile = computed(() => this.supabase.userProfile());
  
  userInitials = computed(() => {
    const profile = this.userProfile();
    if (profile?.fullName) {
      return profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return profile?.email?.charAt(0).toUpperCase() || 'U';
  });

  userOrders = computed(() => {
    const userId = this.supabase.currentUser()?.id;
    if (!userId) return [];
    
    // Filter orders by user email or user_id
    const userEmail = this.userProfile()?.email;
    return this.db.orders().filter(o => 
      o.customerEmail === userEmail
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  totalSpent = computed(() => {
    return this.userOrders().reduce((sum, o) => sum + o.total, 0);
  });

  viewOrder(order: Order) {
    this.selectedOrder.set(order);
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/']);
  }
}
