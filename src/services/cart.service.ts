import { Injectable, computed, signal, inject, effect } from '@angular/core';
import { Product, CartItem } from '../app/models';
import { SupabaseService } from './supabase.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private supabase = inject(SupabaseService);
  
  items = signal<CartItem[]>([]);
  isOpen = signal<boolean>(false);
  private _isSyncing = signal(false);

  constructor() {
    // Load from localStorage first for instant display
    const stored = localStorage.getItem('lumina_cart');
    if (stored) {
      try {
        this.items.set(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to parse stored cart');
      }
    }

    // Sync with backend when user logs in
    effect(() => {
      const user = this.supabase.currentUser();
      if (user && this.supabase.isInitialized()) {
        this.syncWithBackend();
      }
    });
  }

  count = computed(() => this.items().reduce((acc, item) => acc + item.quantity, 0));
  
  total = computed(() => this.items().reduce((acc, item) => {
    const price = item.isSale && item.salePrice ? item.salePrice : item.price;
    return acc + (price * item.quantity);
  }, 0));

  isSyncing = this._isSyncing.asReadonly();

  toggle() {
    this.isOpen.update(v => !v);
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  addToCart(product: Product) {
    this.items.update(items => {
      const existing = items.find(i => i.id === product.id);
      let newItems: CartItem[];
      
      if (existing) {
        newItems = items.map(i => i.id === product.id 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
        );
      } else {
        const cartItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
          isSale: product.isSale,
          salePrice: product.salePrice
        };
        newItems = [...items, cartItem];
      }
      
      this.persist(newItems);
      return newItems;
    });
    this.open();
  }

  removeFromCart(productId: string) {
    this.items.update(items => {
      const newItems = items.filter(i => i.id !== productId);
      this.persist(newItems);
      return newItems;
    });
  }

  updateQuantity(productId: string, delta: number) {
    this.items.update(items => {
      const newItems = items.map(i => {
        if (i.id === productId) {
          return { ...i, quantity: Math.max(1, i.quantity + delta) };
        }
        return i;
      });
      this.persist(newItems);
      return newItems;
    });
  }

  clearCart() {
    this.items.set([]);
    this.persist([]);
    
    // Also clear from backend
    if (this.supabase.currentUser()) {
      this.supabase.clearCart();
    }
  }

  /**
   * Restore a previously removed item (for undo functionality)
   */
  restoreItem(item: CartItem) {
    this.items.update(items => {
      const newItems = [...items, item];
      this.persist(newItems);
      return newItems;
    });
  }

  private persist(items: CartItem[]) {
    // Always save to localStorage for offline/guest support
    localStorage.setItem('lumina_cart', JSON.stringify(items));
    
    // Sync to backend if logged in
    if (this.supabase.currentUser()) {
      this.supabase.saveCart(items).catch(err => {
        console.warn('Failed to sync cart to backend:', err);
      });
    }
  }

  /**
   * Sync cart with backend when user logs in
   * Merges local cart with server cart
   */
  private async syncWithBackend(): Promise<void> {
    this._isSyncing.set(true);
    
    try {
      const { items: serverItems, error } = await this.supabase.getCart();
      
      if (error) {
        console.warn('Failed to fetch cart from backend:', error);
        return;
      }

      const localItems = this.items();
      
      // If server has items and local is empty, use server
      if (serverItems.length > 0 && localItems.length === 0) {
        this.items.set(serverItems);
        localStorage.setItem('lumina_cart', JSON.stringify(serverItems));
      }
      // If local has items, merge and sync to server
      else if (localItems.length > 0) {
        const merged = this.mergeItems(localItems, serverItems);
        this.items.set(merged);
        localStorage.setItem('lumina_cart', JSON.stringify(merged));
        await this.supabase.saveCart(merged);
      }
    } catch (err) {
      console.warn('Cart sync error:', err);
    } finally {
      this._isSyncing.set(false);
    }
  }

  /**
   * Merge local and server cart items
   * Local items take priority for quantities
   */
  private mergeItems(local: CartItem[], server: CartItem[]): CartItem[] {
    const merged = new Map<string, CartItem>();
    
    // Add server items first
    for (const item of server) {
      merged.set(item.id, item);
    }
    
    // Override/add local items
    for (const item of local) {
      const existing = merged.get(item.id);
      if (existing) {
        // Combine quantities
        merged.set(item.id, { ...item, quantity: item.quantity + existing.quantity });
      } else {
        merged.set(item.id, item);
      }
    }
    
    return Array.from(merged.values());
  }
}
