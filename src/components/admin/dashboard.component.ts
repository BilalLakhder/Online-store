import { Component, inject, computed } from '@angular/core';
import { DbService } from '../../services/db.service';
import { CurrencyPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CurrencyPipe, NgClass, RouterLink],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
           <p class="text-gray-500 mt-1">Overview of your store's performance.</p>
        </div>
        <a routerLink="/admin/products" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-all hover:-translate-y-0.5">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Add Product
        </a>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Revenue Card -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <p class="text-sm font-medium text-gray-500">Total Revenue</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats().revenue | currency }}</p>
        </div>

        <!-- Orders Card -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            @if (stats().pendingOrders > 0) {
              <span class="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                {{ stats().pendingOrders }} pending
              </span>
            }
          </div>
          <p class="text-sm font-medium text-gray-500">Total Orders</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats().ordersCount }}</p>
        </div>

        <!-- Products Card -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            @if (stats().lowStock > 0) {
              <span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                {{ stats().lowStock }} low stock
              </span>
            }
          </div>
          <p class="text-sm font-medium text-gray-500">Active Products</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats().productsCount }}</p>
        </div>

        <!-- Customers Card -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
          </div>
          <p class="text-sm font-medium text-gray-500">Customers</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats().customersCount }}</p>
        </div>
      </div>

      <!-- Recent Orders & Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Orders -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-900">Recent Orders</h3>
            <a routerLink="/admin/orders" class="text-sm text-indigo-600 font-medium hover:text-indigo-800">
              View All
            </a>
          </div>
          
          @if (recentOrders().length === 0) {
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="bg-gray-50 p-4 rounded-full mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              <p class="text-gray-500 font-medium">No orders yet</p>
              <p class="text-sm text-gray-400 mt-1">Orders will appear here once customers start purchasing</p>
            </div>
          } @else {
            <div class="divide-y divide-gray-100">
              @for (order of recentOrders(); track order.id) {
                <div class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm">
                      {{ order.customerName.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ order.customerName }}</p>
                      <p class="text-sm text-gray-500">{{ order.id }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">{{ order.total | currency }}</p>
                    <span 
                      class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': order.status === 'pending',
                        'bg-blue-100 text-blue-800': order.status === 'processing',
                        'bg-purple-100 text-purple-800': order.status === 'shipped',
                        'bg-green-100 text-green-800': order.status === 'delivered'
                      }"
                    >
                      {{ order.status }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Quick Links -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
          
          <div class="space-y-3">
            <a routerLink="/admin/products" class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div class="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Add Product</p>
                <p class="text-sm text-gray-500">Create a new product listing</p>
              </div>
            </a>
            
            <a routerLink="/admin/orders" class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Manage Orders</p>
                <p class="text-sm text-gray-500">View and process orders</p>
              </div>
            </a>
            
            <a routerLink="/admin/customers" class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div class="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-200 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">View Customers</p>
                <p class="text-sm text-gray-500">Browse customer profiles</p>
              </div>
            </a>
            
            <a routerLink="/admin/settings" class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div class="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-gray-200 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Store Settings</p>
                <p class="text-sm text-gray-500">Customize your store</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  db = inject(DbService);

  stats = computed(() => {
    const orders = this.db.orders();
    const products = this.db.products();
    const customers = this.db.customers();
    
    return {
      revenue: orders.reduce((sum, order) => sum + order.total, 0),
      ordersCount: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      productsCount: products.length,
      lowStock: products.filter(p => p.inventory < 10).length,
      customersCount: customers.length
    };
  });

  recentOrders = computed(() => this.db.orders().slice(0, 5));
}
