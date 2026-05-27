import { Component, inject, signal, computed } from '@angular/core';
import { DbService, Customer } from '../../services/db.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in relative min-h-screen">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Customers</h2>
           <p class="text-gray-500 mt-1">Manage your customer base and view insights.</p>
        </div>
        <button (click)="showAddModal.set(true)" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-all hover:-translate-y-0.5">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
           Add Customer
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Total -->
        <div class="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
               +12% <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
            </span>
          </div>
          <p class="text-sm font-medium text-gray-500">Total Customers</p>
          <p class="text-3xl font-bold text-gray-900 mt-1 font-mono tracking-tight">{{ db.customers().length }}</p>
        </div>

        <!-- New -->
        <div class="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            </div>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
               +5% <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
            </span>
          </div>
          <p class="text-sm font-medium text-gray-500">New This Month</p>
          <p class="text-3xl font-bold text-gray-900 mt-1 font-mono tracking-tight">{{ newCustomersCount() }}</p>
        </div>

        <!-- Active -->
        <div class="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
             <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
               0% <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </span>
          </div>
          <p class="text-sm font-medium text-gray-500">Active Customers</p>
          <p class="text-3xl font-bold text-gray-900 mt-1 font-mono tracking-tight">{{ activeCustomersCount() }}</p>
        </div>

        <!-- LTV -->
        <div class="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
             <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
               +2.4% <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
            </span>
          </div>
          <p class="text-sm font-medium text-gray-500">Avg. Lifetime Value</p>
          <p class="text-3xl font-bold text-gray-900 mt-1 font-mono tracking-tight">{{ avgLTV() | currency }}</p>
        </div>
      </div>

      <!-- Filters & Controls -->
      <div class="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
         <div class="relative flex-1">
             <input type="text" [(ngModel)]="searchQuery" placeholder="Search customers by name or email..." class="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm">
             <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             @if (searchQuery()) {
               <button (click)="searchQuery.set('')" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
             }
         </div>
         <div class="flex gap-3 overflow-x-auto pb-1 sm:pb-0">
            <select [(ngModel)]="statusFilter" class="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[140px]">
               <option value="all">All Status</option>
               <option value="active">Active</option>
               <option value="inactive">Inactive</option>
               <option value="new">New</option>
            </select>
            <select class="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[140px]">
               <option>Join Date: All</option>
               <option>Last 30 Days</option>
               <option>Last 90 Days</option>
            </select>
            <button (click)="exportCustomers()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
               Export
            </button>
         </div>
      </div>

      <!-- Table -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
         <div class="overflow-x-auto">
            @if (paginatedCustomers().length === 0) {
               <div class="p-12 text-center">
                  <div class="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                     <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">No customers found</h3>
                  <p class="text-gray-500 mb-8 max-w-sm mx-auto">Try adjusting your search or filters.</p>
                  <button (click)="resetFilters()" class="text-indigo-600 font-bold hover:underline">Clear Filters</button>
               </div>
            } @else {
               <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                     <tr>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Customer</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Join Date</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Orders</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Total Spent</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Last Order</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                     </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                     @for (customer of paginatedCustomers(); track customer.id) {
                        <tr (click)="selectCustomer(customer)" class="hover:bg-gray-50 transition-colors cursor-pointer group">
                           <td class="px-6 py-4 whitespace-nowrap">
                              <div class="flex items-center">
                                 <div class="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 overflow-hidden">
                                    <img [src]="customer.avatar" [alt]="customer.name" class="h-full w-full object-cover">
                                 </div>
                                 <div class="ml-4">
                                    <div class="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{{ customer.name }}</div>
                                    <div class="text-xs text-gray-500">{{ customer.email }}</div>
                                 </div>
                              </div>
                           </td>
                           <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.joinDate | date:'mediumDate' }}</td>
                           <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{{ customer.totalOrders }}</td>
                           <td class="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-900">{{ customer.totalSpent | currency }}</td>
                           <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.lastOrderDate | date:'mediumDate' }}</td>
                           <td class="px-6 py-4 whitespace-nowrap">
                              @switch (customer.status) {
                                 @case ('active') {
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                       <span class="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5"></span> Active
                                    </span>
                                 }
                                 @case ('new') {
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                       <span class="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span> New
                                    </span>
                                 }
                                 @default {
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                       Inactive
                                    </span>
                                 }
                              }
                           </td>
                           <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button (click)="$event.stopPropagation(); selectCustomer(customer)" class="text-indigo-600 hover:text-indigo-900 p-1" title="View Details">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                 </button>
                                 <a [href]="'mailto:' + customer.email" (click)="$event.stopPropagation()" class="text-gray-500 hover:text-gray-900 p-1" title="Email">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                 </a>
                                 <button (click)="$event.stopPropagation(); deleteCustomer(customer.id)" class="text-red-500 hover:text-red-700 p-1" title="Delete">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                 </button>
                              </div>
                           </td>
                        </tr>
                     }
                  </tbody>
               </table>
               <!-- Pagination -->
               <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <span class="text-sm text-gray-700">Showing <span class="font-medium">{{ (currentPage() - 1) * pageSize + 1 }}</span> to <span class="font-medium">{{ Math.min(currentPage() * pageSize, filteredCustomers().length) }}</span> of <span class="font-medium">{{ filteredCustomers().length }}</span> customers</span>
                  <div class="flex gap-2">
                     <button [disabled]="currentPage() === 1" (click)="currentPage.set(currentPage() - 1)" class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50">Previous</button>
                     <button [disabled]="currentPage() * pageSize >= filteredCustomers().length" (click)="currentPage.set(currentPage() + 1)" class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
                  </div>
               </div>
            }
         </div>
      </div>
    </div>

    <!-- Add Customer Modal -->
    @if (showAddModal()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="flex min-h-full items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" (click)="closeAddModal()"></div>
          
          <!-- Modal -->
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">Add New Customer</h2>
              <button (click)="closeAddModal()" class="text-gray-400 hover:text-gray-500 p-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form (submit)="addCustomer($event)" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  [(ngModel)]="newCustomer.name" 
                  name="name"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="John Smith"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input 
                  type="email" 
                  [(ngModel)]="newCustomer.email" 
                  name="email"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="john@example.com"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="tel" 
                  [(ngModel)]="newCustomer.phone" 
                  name="phone"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+1 (555) 000-0000"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                <textarea 
                  [(ngModel)]="newCustomer.address" 
                  name="address"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="123 Main St, City, State 12345"
                ></textarea>
              </div>

              @if (addError()) {
                <p class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{{ addError() }}</p>
              }
              
              <div class="flex gap-3 pt-4">
                <button 
                  type="button" 
                  (click)="closeAddModal()" 
                  class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  [disabled]="isAdding()"
                  class="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {{ isAdding() ? 'Adding...' : 'Add Customer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Customer Detail Slide-out -->
    @if (selectedCustomer()) {
       <div class="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" (click)="selectedCustomer.set(null)"></div>
          
          <!-- Panel -->
          <div class="absolute inset-y-0 right-0 max-w-xl w-full flex">
             <div class="relative w-full bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
                <!-- Header -->
                <div class="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between">
                   <div class="flex items-center gap-5">
                      <div class="h-20 w-20 rounded-full bg-white p-1 shadow-sm border border-gray-100">
                         <img [src]="selectedCustomer()!.avatar" class="h-full w-full rounded-full object-cover">
                      </div>
                      <div>
                         <h2 class="text-2xl font-bold text-gray-900">{{ selectedCustomer()!.name }}</h2>
                         <a [href]="'mailto:' + selectedCustomer()!.email" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 mt-1">
                            {{ selectedCustomer()!.email }}
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                         </a>
                         <p class="text-xs text-gray-500 mt-2">Member since {{ selectedCustomer()!.joinDate | date:'mediumDate' }}</p>
                      </div>
                   </div>
                   <button (click)="selectedCustomer.set(null)" class="text-gray-400 hover:text-gray-500">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                   </button>
                </div>

                <!-- Tabs -->
                <div class="flex border-b border-gray-200 px-8">
                   <button 
                     (click)="activeTab.set('overview')" 
                     class="py-4 px-2 border-b-2 font-medium text-sm transition-colors mr-6"
                     [class.border-indigo-600]="activeTab() === 'overview'"
                     [class.text-indigo-600]="activeTab() === 'overview'"
                     [class.border-transparent]="activeTab() !== 'overview'"
                     [class.text-gray-500]="activeTab() !== 'overview'"
                   >Overview</button>
                   <button 
                     (click)="activeTab.set('orders')" 
                     class="py-4 px-2 border-b-2 font-medium text-sm transition-colors mr-6"
                     [class.border-indigo-600]="activeTab() === 'orders'"
                     [class.text-indigo-600]="activeTab() === 'orders'"
                     [class.border-transparent]="activeTab() !== 'orders'"
                     [class.text-gray-500]="activeTab() !== 'orders'"
                   >Orders</button>
                   <button 
                     (click)="activeTab.set('activity')" 
                     class="py-4 px-2 border-b-2 font-medium text-sm transition-colors"
                     [class.border-indigo-600]="activeTab() === 'activity'"
                     [class.text-indigo-600]="activeTab() === 'activity'"
                     [class.border-transparent]="activeTab() !== 'activity'"
                     [class.text-gray-500]="activeTab() !== 'activity'"
                   >Activity</button>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                   @if (activeTab() === 'overview') {
                      <div class="space-y-8 animate-fade-in">
                         <!-- Stats -->
                         <div class="grid grid-cols-2 gap-4">
                            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                               <p class="text-xs font-medium text-gray-500 uppercase">Total Spent</p>
                               <p class="text-xl font-bold text-gray-900 mt-1">{{ selectedCustomer()!.totalSpent | currency }}</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                               <p class="text-xs font-medium text-gray-500 uppercase">Orders</p>
                               <p class="text-xl font-bold text-gray-900 mt-1">{{ selectedCustomer()!.totalOrders }}</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                               <p class="text-xs font-medium text-gray-500 uppercase">AOV</p>
                               <p class="text-xl font-bold text-gray-900 mt-1">{{ selectedCustomer()!.totalSpent / (selectedCustomer()!.totalOrders || 1) | currency }}</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                               <p class="text-xs font-medium text-gray-500 uppercase">Status</p>
                               <div class="mt-1">
                                  @if(selectedCustomer()!.status === 'active') {
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">Active</span>
                                  } @else {
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800 uppercase">{{ selectedCustomer()!.status }}</span>
                                  }
                               </div>
                            </div>
                         </div>

                         <!-- Contact -->
                         <div>
                            <h3 class="text-sm font-bold text-gray-900 mb-4">Contact Information</h3>
                            <div class="space-y-3">
                               <div class="flex gap-3 text-sm">
                                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                  <span class="text-gray-600">{{ selectedCustomer()!.email }}</span>
                               </div>
                               @if(selectedCustomer()!.phone) {
                                  <div class="flex gap-3 text-sm">
                                     <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                     <span class="text-gray-600">{{ selectedCustomer()!.phone }}</span>
                                  </div>
                               }
                               @if(selectedCustomer()!.shippingAddress) {
                                  <div class="flex gap-3 text-sm">
                                     <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                     <span class="text-gray-600">{{ selectedCustomer()!.shippingAddress }}</span>
                                  </div>
                               }
                            </div>
                         </div>
                      </div>
                   } @else if (activeTab() === 'orders') {
                      <div class="space-y-4 animate-fade-in">
                         <!-- Simplified Mock Orders -->
                         @if(selectedCustomer()!.totalOrders > 0) {
                            <!-- We don't have real orders linked in mock DB by ID, so creating fake list based on count -->
                            @for(i of [1,2,3]; track i) {
                               <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                  <div class="flex justify-between items-start mb-2">
                                     <span class="font-mono font-bold text-indigo-600 text-sm">#ORD-{{ 8000 + i }}</span>
                                     <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">Delivered</span>
                                  </div>
                                  <div class="flex justify-between items-center">
                                     <span class="text-sm text-gray-500">Jan {{ 10 + i }}, 2024</span>
                                     <span class="font-bold text-gray-900">{{ (50 + i * 20) | currency }}</span>
                                  </div>
                               </div>
                            }
                         } @else {
                            <p class="text-gray-500 text-center py-8">No orders yet.</p>
                         }
                      </div>
                   } @else {
                      <div class="relative pl-6 border-l border-gray-200 space-y-8 animate-fade-in">
                         <div class="relative">
                            <span class="absolute -left-[29px] bg-green-500 h-3 w-3 rounded-full ring-4 ring-white"></span>
                            <p class="text-sm font-medium text-gray-900">Placed an order</p>
                            <p class="text-xs text-gray-500">2 days ago</p>
                         </div>
                         <div class="relative">
                            <span class="absolute -left-[29px] bg-blue-500 h-3 w-3 rounded-full ring-4 ring-white"></span>
                            <p class="text-sm font-medium text-gray-900">Account created</p>
                            <p class="text-xs text-gray-500">{{ selectedCustomer()!.joinDate | date:'mediumDate' }}</p>
                         </div>
                      </div>
                   }
                </div>

                <!-- Footer -->
                <div class="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                   <button class="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Send Email</button>
                   <button (click)="deleteCustomer(selectedCustomer()!.id); selectedCustomer.set(null)" class="flex-1 bg-white border border-gray-300 text-red-600 font-bold py-3 rounded-lg hover:bg-red-50 transition-colors">Delete Customer</button>
                </div>
             </div>
          </div>
       </div>
    }
  `
})
export class CustomersAdminComponent {
  db = inject(DbService);
  Math = Math; // Template access

  // State
  searchQuery = signal('');
  statusFilter = signal<string>('all');
  currentPage = signal(1);
  pageSize = 15;
  
  // UI State
  selectedCustomer = signal<Customer | null>(null);
  activeTab = signal<'overview' | 'orders' | 'activity'>('overview');
  showAddModal = signal(false);
  isAdding = signal(false);
  addError = signal<string | null>(null);
  
  // New customer form
  newCustomer = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  // Stats
  activeCustomersCount = computed(() => this.db.customers().filter(c => c.status === 'active').length);
  newCustomersCount = computed(() => this.db.customers().filter(c => c.status === 'new').length);
  avgLTV = computed(() => {
     const customers = this.db.customers();
     if (customers.length === 0) return 0;
     const total = customers.reduce((sum, c) => sum + c.totalSpent, 0);
     return total / customers.length;
  });

  // Filtered Data
  filteredCustomers = computed(() => {
     let data = this.db.customers();
     const query = this.searchQuery().toLowerCase();
     const status = this.statusFilter();

     if (query) {
        data = data.filter(c => 
           c.name.toLowerCase().includes(query) || 
           c.email.toLowerCase().includes(query)
        );
     }

     if (status !== 'all') {
        data = data.filter(c => c.status === status);
     }
     
     // Sort by join date desc default
     return data.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  });

  paginatedCustomers = computed(() => {
     const data = this.filteredCustomers();
     const start = (this.currentPage() - 1) * this.pageSize;
     return data.slice(start, start + this.pageSize);
  });

  // Actions
  selectCustomer(customer: Customer) {
     this.selectedCustomer.set(customer);
     this.activeTab.set('overview');
  }

  deleteCustomer(id: string) {
     if(confirm('Are you sure you want to delete this customer? This cannot be undone.')) {
        this.db.deleteCustomer(id);
     }
  }

  resetFilters() {
     this.searchQuery.set('');
     this.statusFilter.set('all');
     this.currentPage.set(1);
  }

  // Add Customer
  closeAddModal() {
    this.showAddModal.set(false);
    this.addError.set(null);
    this.newCustomer = { name: '', email: '', phone: '', address: '' };
  }

  async addCustomer(event: Event) {
    event.preventDefault();
    
    if (!this.newCustomer.name || !this.newCustomer.email) {
      this.addError.set('Name and email are required');
      return;
    }

    // Check for duplicate email
    const existing = this.db.customers().find(c => c.email.toLowerCase() === this.newCustomer.email.toLowerCase());
    if (existing) {
      this.addError.set('A customer with this email already exists');
      return;
    }

    this.isAdding.set(true);
    this.addError.set(null);

    try {
      await this.db.addCustomer({
        name: this.newCustomer.name,
        email: this.newCustomer.email,
        phone: this.newCustomer.phone || undefined,
        shippingAddress: this.newCustomer.address || undefined
      });
      
      this.closeAddModal();
    } catch (err) {
      this.addError.set('Failed to add customer. Please try again.');
    } finally {
      this.isAdding.set(false);
    }
  }

  // Export Customers to CSV
  exportCustomers() {
    const customers = this.filteredCustomers();
    if (customers.length === 0) {
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Join Date', 'Total Orders', 'Total Spent', 'Status'];
    const rows = customers.map(c => [
      c.name,
      c.email,
      c.phone || '',
      new Date(c.joinDate).toLocaleDateString(),
      c.totalOrders.toString(),
      c.totalSpent.toFixed(2),
      c.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}