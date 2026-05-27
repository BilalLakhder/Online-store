import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DbService } from '../../services/db.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50 flex font-sans">
      <!-- Sidebar -->
      <aside class="w-64 bg-[#111827] text-gray-300 flex flex-col fixed h-full z-30 transition-all shadow-xl">
        <!-- Brand -->
        <div class="p-6 border-b border-gray-800 flex items-center gap-3">
          <div class="h-8 w-8 rounded bg-indigo-500 flex items-center justify-center text-white font-serif font-bold text-lg">L</div>
          <div>
            <h1 class="text-white font-bold tracking-wide text-sm">LUMINA</h1>
            <span class="text-xs text-gray-500">Commerce OS</span>
          </div>
        </div>
        
        <!-- User Profile (Compact) -->
        <div class="px-4 py-6">
           <div class="flex items-center gap-3 px-2">
              <div class="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                 <img src="https://i.pravatar.cc/150?u=admin" class="rounded-full h-full w-full object-cover border-2 border-[#111827]" alt="Admin">
              </div>
              <div class="flex-1 min-w-0">
                 <p class="text-sm font-medium text-white truncate">Administrator</p>
                 <p class="text-xs text-gray-500 truncate">admin@lumina.com</p>
              </div>
           </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-2">Overview</p>
          
          <a routerLink="/admin/dashboard" routerLinkActive="bg-gray-800 text-white shadow-sm ring-1 ring-white/10" class="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all hover:bg-gray-800 hover:text-white">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Dashboard
          </a>

          <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Management</p>

          <a routerLink="/admin/orders" routerLinkActive="bg-gray-800 text-white shadow-sm ring-1 ring-white/10" class="group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all hover:bg-gray-800 hover:text-white">
            <div class="flex items-center gap-3">
               <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
               Orders
            </div>
            @if(pendingOrdersCount() > 0) {
              <span class="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{{ pendingOrdersCount() }}</span>
            }
          </a>

          <a routerLink="/admin/products" routerLinkActive="bg-gray-800 text-white shadow-sm ring-1 ring-white/10" class="group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all hover:bg-gray-800 hover:text-white">
             <div class="flex items-center gap-3">
               <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
               Products
             </div>
             @if(lowStockCount() > 0) {
               <span class="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{{ lowStockCount() }}</span>
             }
          </a>

          <a routerLink="/admin/customers" routerLinkActive="bg-gray-800 text-white shadow-sm ring-1 ring-white/10" class="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all hover:bg-gray-800 hover:text-white">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Customers
          </a>

           <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Configuration</p>

          <a routerLink="/admin/settings" routerLinkActive="bg-gray-800 text-white shadow-sm ring-1 ring-white/10" class="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all hover:bg-gray-800 hover:text-white">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Settings
          </a>
        </nav>
        
        <!-- Bottom Actions -->
        <div class="p-4 border-t border-gray-800 space-y-2">
           <a routerLink="/" class="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             Back to Store
           </a>
           <button (click)="handleLogout()" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
             Sign Out
           </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="ml-64 flex-1 p-8 lg:p-10 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  db = inject(DbService);

  pendingOrdersCount = computed(() => this.db.orders().filter(o => o.status === 'pending').length);
  lowStockCount = computed(() => this.db.products().filter(p => p.inventory < 10).length);

  async handleLogout() {
    await this.auth.logout();
  }
}