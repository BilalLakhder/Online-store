import { Component, inject, signal, computed } from '@angular/core';
import { DbService, Order } from '../../services/db.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <h2 class="text-2xl font-bold text-gray-800">Orders</h2>
         <div class="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button 
              (click)="filterStatus.set('all')" 
              class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
              [class]="filterStatus() === 'all' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'"
            >All</button>
            <button 
              (click)="filterStatus.set('pending')" 
              class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
               [class]="filterStatus() === 'pending' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'"
            >Pending</button>
             <button 
              (click)="filterStatus.set('completed')" 
              class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
               [class]="filterStatus() === 'completed' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'"
            >Completed</button>
         </div>
      </div>

      <!-- Stats Cards -->
      @if (filteredOrders().length > 0 || filterStatus() === 'all') {
         <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <p class="text-sm font-medium text-gray-500">Total Orders</p>
               <p class="text-3xl font-bold text-gray-900 mt-2">{{ db.orders().length }}</p>
            </div>
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <p class="text-sm font-medium text-gray-500">Pending Fulfillment</p>
               <p class="text-3xl font-bold text-orange-600 mt-2">{{ pendingCount() }}</p>
            </div>
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <p class="text-sm font-medium text-gray-500">Avg. Order Value</p>
               <p class="text-3xl font-bold text-green-600 mt-2">{{ averageOrderValue() | currency }}</p>
            </div>
         </div>
      }

      @if (db.orders().length === 0) {
         <!-- Empty State -->
         <div class="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
            <div class="mx-auto w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
               <svg class="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p class="text-gray-500 mb-8 max-w-sm mx-auto">Your first order will appear here. Share your store link to get started!</p>
         </div>
      } @else {
         <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
               <thead class="bg-gray-50">
               <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
               </tr>
               </thead>
               <tbody class="bg-white divide-y divide-gray-200">
               @for (order of filteredOrders(); track order.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                     <td class="px-6 py-4 whitespace-nowrap">
                        <span class="font-mono font-medium text-indigo-600 text-sm">#{{ order.id.slice(0, 8) }}</span>
                     </td>
                     <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                           <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3">
                              {{ order.customerName.charAt(0) }}
                           </div>
                           <div>
                              <div class="text-sm font-medium text-gray-900">{{ order.customerName }}</div>
                              <div class="text-xs text-gray-500">{{ order.customerEmail }}</div>
                           </div>
                        </div>
                     </td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.date | date:'mediumDate' }}</td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{{ order.total | currency }}</td>
                     <td class="px-6 py-4 whitespace-nowrap">
                        <select 
                           [ngModel]="order.status" 
                           (ngModelChange)="updateStatus(order.id, $event)"
                           class="rounded-full px-3 py-1 text-xs font-bold border-0 focus:ring-0 cursor-pointer transition-colors
                           {{ order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                              'bg-orange-100 text-orange-800' }}"
                        >
                           <option value="pending">Pending</option>
                           <option value="processing">Processing</option>
                           <option value="shipped">Shipped</option>
                           <option value="delivered">Delivered</option>
                        </select>
                     </td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button (click)="viewDetails(order)" class="text-gray-400 hover:text-indigo-600 transition-colors p-1">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </button>
                     </td>
                  </tr>
               }
               </tbody>
            </table>
         </div>
      }
    </div>

    <!-- Order Detail Slide-out -->
    @if (selectedOrder()) {
      <div class="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" (click)="selectedOrder.set(null)"></div>
        
        <!-- Panel -->
        <div class="absolute inset-y-0 right-0 max-w-lg w-full flex">
          <div class="relative w-full bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
            <!-- Header -->
            <div class="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-gray-900">Order Details</h2>
                <p class="text-sm text-gray-500 font-mono mt-0.5">#{{ selectedOrder()!.id.slice(0, 8) }}</p>
              </div>
              <button (click)="selectedOrder.set(null)" class="text-gray-400 hover:text-gray-500 p-1">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto">
              <!-- Status Banner -->
              <div class="px-6 py-4 border-b border-gray-100" 
                [class]="selectedOrder()!.status === 'delivered' ? 'bg-green-50' : 
                         selectedOrder()!.status === 'shipped' ? 'bg-purple-50' :
                         selectedOrder()!.status === 'processing' ? 'bg-blue-50' : 'bg-orange-50'">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full flex items-center justify-center"
                      [class]="selectedOrder()!.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                               selectedOrder()!.status === 'shipped' ? 'bg-purple-100 text-purple-600' :
                               selectedOrder()!.status === 'processing' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'">
                      @if (selectedOrder()!.status === 'delivered') {
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                      } @else if (selectedOrder()!.status === 'shipped') {
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                      } @else {
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      }
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 capitalize">{{ selectedOrder()!.status }}</p>
                      <p class="text-sm text-gray-600">{{ selectedOrder()!.date | date:'medium' }}</p>
                    </div>
                  </div>
                  <select 
                    [ngModel]="selectedOrder()!.status" 
                    (ngModelChange)="updateStatus(selectedOrder()!.id, $event)"
                    class="rounded-lg px-3 py-2 text-sm font-medium border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <!-- Customer Info -->
              <div class="px-6 py-5 border-b border-gray-100">
                <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Customer</h3>
                <div class="flex items-center gap-4">
                  <div class="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                    {{ selectedOrder()!.customerName.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">{{ selectedOrder()!.customerName }}</p>
                    <a [href]="'mailto:' + selectedOrder()!.customerEmail" class="text-sm text-indigo-600 hover:underline">
                      {{ selectedOrder()!.customerEmail }}
                    </a>
                  </div>
                </div>
                @if (selectedOrder()!.shippingAddress) {
                  <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p class="text-xs font-bold text-gray-500 uppercase mb-1">Shipping Address</p>
                    <p class="text-sm text-gray-700">{{ selectedOrder()!.shippingAddress }}</p>
                  </div>
                }
              </div>

              <!-- Order Items -->
              <div class="px-6 py-5">
                <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Items ({{ selectedOrder()!.items.length }})</h3>
                <div class="space-y-4">
                  @for (item of selectedOrder()!.items; track item.id) {
                    <div class="flex gap-4 p-3 bg-gray-50 rounded-lg">
                      <div class="h-16 w-16 rounded-lg bg-white border border-gray-100 overflow-hidden flex-shrink-0">
                        <img [src]="item.imageUrl" [alt]="item.name" class="h-full w-full object-cover">
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-900 truncate">{{ item.name }}</p>
                        <p class="text-sm text-gray-500">Qty: {{ item.quantity }}</p>
                      </div>
                      <div class="text-right">
                        <p class="font-bold text-gray-900">{{ (item.salePrice || item.price) * item.quantity | currency }}</p>
                        @if (item.salePrice && item.salePrice < item.price) {
                          <p class="text-xs text-gray-400 line-through">{{ item.price * item.quantity | currency }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-100 bg-gray-50 p-6">
              <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Subtotal</span>
                  <span class="text-gray-900">{{ selectedOrder()!.total | currency }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Shipping</span>
                  <span class="text-green-600 font-medium">Free</span>
                </div>
                <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span class="text-gray-900">Total</span>
                  <span class="text-gray-900">{{ selectedOrder()!.total | currency }}</span>
                </div>
              </div>
              <button (click)="selectedOrder.set(null)" class="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class OrdersAdminComponent {
  db = inject(DbService);
  filterStatus = signal<'all' | 'pending' | 'completed'>('all');
  selectedOrder = signal<Order | null>(null);

  pendingCount = computed(() => this.db.orders().filter(o => o.status === 'pending' || o.status === 'processing').length);
  
  averageOrderValue = computed(() => {
     const orders = this.db.orders();
     if (orders.length === 0) return 0;
     const total = orders.reduce((sum, o) => sum + o.total, 0);
     return total / orders.length;
  });

  filteredOrders = computed(() => {
     const status = this.filterStatus();
     const orders = this.db.orders();
     if (status === 'all') return orders;
     if (status === 'pending') return orders.filter(o => o.status === 'pending' || o.status === 'processing');
     return orders.filter(o => o.status === 'shipped' || o.status === 'delivered');
  });

  updateStatus(id: string, status: any) {
    this.db.updateOrderStatus(id, status);
  }

  viewDetails(order: Order) {
    this.selectedOrder.set(order);
  }
}
