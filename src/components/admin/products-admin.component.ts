import { Component, inject, signal, computed } from '@angular/core';
import { DbService, Product } from '../../services/db.service';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p class="text-xs font-medium text-gray-500 uppercase">Total Products</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ db.products().length }}</p>
         </div>
         <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p class="text-xs font-medium text-gray-500 uppercase">Low Stock</p>
            <p class="text-2xl font-bold text-orange-600 mt-1">{{ lowStockCount() }}</p>
         </div>
         <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p class="text-xs font-medium text-gray-500 uppercase">Out of Stock</p>
            <p class="text-2xl font-bold text-red-600 mt-1">{{ outOfStockCount() }}</p>
         </div>
         <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p class="text-xs font-medium text-gray-500 uppercase">Total Inventory</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ totalInventory() }}</p>
         </div>
      </div>

      <!-- Controls -->
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div class="relative w-full sm:w-96">
           <input type="text" placeholder="Search products..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm" [(ngModel)]="searchQuery">
           <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <div class="flex gap-3 w-full sm:w-auto">
           <select class="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white">
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Furniture</option>
           </select>
           <button (click)="openModal()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 whitespace-nowrap">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
             Add Product
           </button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Inventory</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (product of filteredProducts(); track product.id) {
                <tr class="hover:bg-gray-50 transition-colors group">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img class="h-full w-full object-cover" [src]="product.imageUrl" alt="">
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{{ product.name }}</div>
                        <div class="text-xs text-gray-500">ID: {{ product.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                     <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {{ product.category }}
                     </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">{{ product.price | currency }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                     @if(product.inventory === 0) {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                           <span class="h-1.5 w-1.5 rounded-full bg-red-600"></span> Out of Stock
                        </span>
                     } @else if (product.inventory < 10) {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                           <span class="h-1.5 w-1.5 rounded-full bg-orange-600"></span> Low Stock
                        </span>
                     } @else {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           <span class="h-1.5 w-1.5 rounded-full bg-green-600"></span> In Stock
                        </span>
                     }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                     {{ product.inventory }} units
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button (click)="editProduct(product)" class="p-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors" title="Edit">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                       </button>
                       <button (click)="deleteProduct(product.id)" class="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors" title="Delete">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          @if (filteredProducts().length === 0) {
             <div class="text-center py-12">
                <p class="text-gray-500">No products found matching your search.</p>
             </div>
          }
        </div>
      </div>
    </div>

    <!-- Modal (Kept simple for brevity, styled similarly to dashboard) -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>
          
          <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
            <div class="bg-white px-6 pt-6 pb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-6">{{ editingId() ? 'Edit Product' : 'Add New Product' }}</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input type="text" [(ngModel)]="formData.name" class="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                </div>
                <!-- ... other fields ... -->
                <!-- Simplified for brevity, assume similar styling applied to all fields -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input type="number" [(ngModel)]="formData.price" class="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5">
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Inventory</label>
                   <input type="number" [(ngModel)]="formData.inventory" class="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5">
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                   <input type="text" [(ngModel)]="formData.category" class="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5">
                </div>
                 <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea [(ngModel)]="formData.description" rows="3" class="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5"></textarea>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
              <button type="button" (click)="saveProduct()" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none transition-all">
                Save Product
              </button>
              <button type="button" (click)="closeModal()" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ProductsAdminComponent {
  db = inject(DbService);
  isModalOpen = signal(false);
  editingId = signal<string | null>(null);
  searchQuery = signal('');

  formData: Omit<Product, 'id'> = {
    name: '',
    description: '',
    price: 0,
    inventory: 0,
    category: '',
    imageUrl: '',
    rating: 0,
    reviewCount: 0,
    isNew: false,
    isSale: false,
    salePrice: 0
  };

  lowStockCount = computed(() => this.db.products().filter(p => p.inventory < 10).length);
  outOfStockCount = computed(() => this.db.products().filter(p => p.inventory === 0).length);
  totalInventory = computed(() => this.db.products().reduce((sum, p) => sum + p.inventory, 0));

  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.db.products().filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
  });

  openModal() {
    this.resetForm();
    this.isModalOpen.set(true);
  }

  editProduct(product: Product) {
    const { id, ...data } = product;
    this.formData = { 
      ...data,
      isNew: data.isNew ?? false,
      isSale: data.isSale ?? false,
      salePrice: data.salePrice ?? 0
    };
    this.editingId.set(id);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingId.set(null);
  }

  saveProduct() {
    if(!this.formData.imageUrl) this.formData.imageUrl = 'https://picsum.photos/400/400';
    if (this.editingId()) {
      this.db.updateProduct(this.editingId()!, this.formData);
    } else {
      this.db.addProduct(this.formData);
    }
    this.closeModal();
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.db.deleteProduct(id);
    }
  }

  resetForm() {
    this.formData = {
      name: '',
      description: '',
      price: 0,
      inventory: 0,
      category: '',
      imageUrl: 'https://picsum.photos/400/400',
      rating: 4.5,
      reviewCount: 0,
      isNew: true,
      isSale: false,
      salePrice: 0
    };
    this.editingId.set(null);
  }
}