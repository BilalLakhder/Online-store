import { Injectable, signal, inject, effect } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Product, mapProductToSupabase } from '../app/models/product.model';
import { Order, OrderStatus } from '../app/models/order.model';
import { Customer } from '../app/models/customer.model';
import { CartItem } from '../app/models/cart-item.model';

// Re-export types for backward compatibility
export type { Product } from '../app/models/product.model';
export type { Order, OrderStatus } from '../app/models/order.model';
export type { Customer } from '../app/models/customer.model';
export type { CartItem } from '../app/models/cart-item.model';

// Initial products for fallback/seeding (kept for development)
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Minimalist Chronograph',
    description: 'A sleek, modern timepiece designed for the urban professional. Features a genuine leather strap, sapphire crystal glass, and a water-resistant casing up to 50 meters.',
    price: 199.00,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=800'
    ],
    inventory: 45,
    rating: 4.8,
    reviewCount: 124,
    isNew: true,
    colors: ['#000000', '#8B4513'],
    sizes: ['One Size']
  },
  {
    id: '2',
    name: 'Noise-Cancelling Headphones',
    description: 'Immerse yourself in pure sound with our premium wireless headphones. 30-hour battery life, adaptive noise cancellation, and plush memory foam ear cups.',
    price: 349.00,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800'
    ],
    inventory: 20,
    rating: 4.9,
    reviewCount: 89,
    isSale: true,
    salePrice: 299.00,
    colors: ['#000000', '#CCCCCC'],
    sizes: ['One Size']
  },
  {
    id: '3',
    name: 'Ergonomic Office Chair',
    description: 'Designed for comfort and productivity. Fully adjustable lumbar support, breathable mesh back, and premium castors that glide smoothly on any surface.',
    price: 499.00,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=800'
    ],
    inventory: 12,
    rating: 4.7,
    reviewCount: 56,
    colors: ['#333333', '#808080'],
    sizes: ['Standard', 'Large']
  },
  {
    id: '4',
    name: 'Ceramic Pour-Over Set',
    description: 'Brew the perfect cup every morning. Handcrafted ceramic dripper with a sustainable bamboo stand. The minimalist design looks beautiful on any counter.',
    price: 85.00,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
    inventory: 60,
    rating: 4.6,
    reviewCount: 32,
    colors: ['#FFFFFF', '#000000'],
    sizes: ['One Size']
  },
  {
    id: '5',
    name: 'Leather Weekend Bag',
    description: 'The perfect companion for short trips. Full-grain leather that ages beautifully with time. Features a dedicated shoe compartment and laptop sleeve.',
    price: 245.00,
    category: 'Travel',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    inventory: 15,
    rating: 4.9,
    reviewCount: 210,
    isNew: true,
    colors: ['#8B4513', '#000000'],
    sizes: ['40L', '60L']
  },
  {
    id: '6',
    name: 'Mechanical Keyboard',
    description: 'Tactile switches and customizable RGB lighting in a compact 60% form factor. Aluminium chassis for durability and a premium typing experience.',
    price: 129.00,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
    inventory: 30,
    rating: 4.5,
    reviewCount: 45,
    colors: ['#000000', '#FFFFFF', '#FFB6C1'],
    sizes: ['60%', 'TKL', 'Full']
  }
];

// Generate fake customers for fallback
const NAMES = ['Sarah Johnson', 'Michael Chen', 'Emma Wilson', 'James Miller', 'Olivia Davis'];

const INITIAL_CUSTOMERS: Customer[] = NAMES.map((name, index) => {
  const isActive = Math.random() > 0.3;
  const isNew = Math.random() > 0.8;
  const orders = Math.floor(Math.random() * 20);
  const spent = orders * (50 + Math.random() * 200);

  return {
    id: `cust_${index + 100}`,
    name,
    email: name.toLowerCase().replace(' ', '.') + '@example.com',
    avatar: `https://i.pravatar.cc/150?u=${name.replace(' ', '')}`,
    joinDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    totalOrders: orders,
    totalSpent: spent,
    lastOrderDate: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)).toISOString(),
    status: isNew ? 'new' : (isActive ? 'active' : 'inactive'),
    phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    shippingAddress: `${Math.floor(100 + Math.random() * 900)} Main St, San Francisco, CA 94105`
  };
});

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private supabase = inject(SupabaseService);
  
  // Reactive state
  products = signal<Product[]>([]);
  orders = signal<Order[]>([]);
  customers = signal<Customer[]>([]);
  
  // Loading states
  private _isLoadingProducts = signal(false);
  private _isLoadingOrders = signal(false);
  private _isLoadingCustomers = signal(false);
  
  readonly isLoadingProducts = this._isLoadingProducts.asReadonly();
  readonly isLoadingOrders = this._isLoadingOrders.asReadonly();
  readonly isLoadingCustomers = this._isLoadingCustomers.asReadonly();

  constructor() {
    this.loadData();
  }

  /**
   * Load all data from Supabase.
   * Falls back to localStorage/initial data if Supabase fails.
   */
  async loadData(): Promise<void> {
    await Promise.all([
      this.loadProducts(),
      this.loadOrders(),
      this.loadCustomers()
    ]);
  }

  /**
   * Load products from Supabase
   */
  async loadProducts(): Promise<void> {
    this._isLoadingProducts.set(true);
    
    try {
      const { data, error } = await this.supabase.getProducts();
      
      if (error || data.length === 0) {
        // Fallback to localStorage or initial data
        console.warn('Supabase products fetch failed or empty, using fallback:', error?.message);
        const stored = localStorage.getItem('lumina_products');
        if (stored) {
          this.products.set(JSON.parse(stored));
        } else {
          this.products.set(INITIAL_PRODUCTS);
          this.saveProductsLocal(INITIAL_PRODUCTS);
        }
      } else {
        this.products.set(data);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      // Fallback
      const stored = localStorage.getItem('lumina_products');
      this.products.set(stored ? JSON.parse(stored) : INITIAL_PRODUCTS);
    } finally {
      this._isLoadingProducts.set(false);
    }
  }

  /**
   * Load orders from Supabase
   */
  async loadOrders(): Promise<void> {
    this._isLoadingOrders.set(true);
    
    try {
      const { data, error } = await this.supabase.getOrders();
      
      if (error) {
        console.warn('Supabase orders fetch failed, using localStorage:', error.message);
        const stored = localStorage.getItem('lumina_orders');
        this.orders.set(stored ? JSON.parse(stored) : []);
      } else {
        this.orders.set(data);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      const stored = localStorage.getItem('lumina_orders');
      this.orders.set(stored ? JSON.parse(stored) : []);
    } finally {
      this._isLoadingOrders.set(false);
    }
  }

  /**
   * Load customers from Supabase profiles
   */
  async loadCustomers(): Promise<void> {
    this._isLoadingCustomers.set(true);
    
    try {
      const { data, error } = await this.supabase.getCustomers();
      
      if (error || data.length === 0) {
        console.warn('Supabase customers fetch failed or empty, using fallback:', error?.message);
        const stored = localStorage.getItem('lumina_customers');
        if (stored) {
          this.customers.set(JSON.parse(stored));
        } else {
          this.customers.set(INITIAL_CUSTOMERS);
          this.saveCustomersLocal(INITIAL_CUSTOMERS);
        }
      } else {
        this.customers.set(data);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
      const stored = localStorage.getItem('lumina_customers');
      this.customers.set(stored ? JSON.parse(stored) : INITIAL_CUSTOMERS);
    } finally {
      this._isLoadingCustomers.set(false);
    }
  }

  // ============================================
  // PRODUCT OPERATIONS
  // ============================================

  /**
   * Add a new product
   */
  async addProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    try {
      const { data, error } = await this.supabase.createProduct(product);
      
      if (error || !data) {
        // Fallback to local
        console.warn('Supabase addProduct failed, using localStorage:', error?.message);
        const localProduct = { ...product, id: crypto.randomUUID() } as Product;
        const updated = [...this.products(), localProduct];
        this.saveProductsLocal(updated);
        this.products.set(updated);
        return localProduct;
      }
      
      // Refresh from Supabase
      await this.loadProducts();
      return data;
    } catch (err) {
      console.error('Error adding product:', err);
      return null;
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    try {
      const { error } = await this.supabase.updateProduct(id, data);
      
      if (error) {
        console.warn('Supabase updateProduct failed, using localStorage:', error.message);
        const updated = this.products().map(p => p.id === id ? { ...p, ...data } : p);
        this.saveProductsLocal(updated);
        this.products.set(updated);
        return;
      }
      
      await this.loadProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      // Fallback to local update
      const updated = this.products().map(p => p.id === id ? { ...p, ...data } : p);
      this.saveProductsLocal(updated);
      this.products.set(updated);
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.deleteProduct(id);
      
      if (error) {
        console.warn('Supabase deleteProduct failed, using localStorage:', error.message);
      }
      
      const updated = this.products().filter(p => p.id !== id);
      this.saveProductsLocal(updated);
      this.products.set(updated);
    } catch (err) {
      console.error('Error deleting product:', err);
      const updated = this.products().filter(p => p.id !== id);
      this.saveProductsLocal(updated);
      this.products.set(updated);
    }
  }

  // ============================================
  // ORDER OPERATIONS
  // ============================================

  /**
   * Create a new order
   */
  async createOrder(orderData: {
    customerName: string;
    customerEmail: string;
    items: CartItem[];
    total: number;
    shippingAddress?: string;
  }): Promise<Order | null> {
    const userId = this.supabase.currentUser()?.id;
    
    try {
      const { data, error } = await this.supabase.createOrder({
        ...orderData,
        userId
      });
      
      if (error || !data) {
        console.warn('Supabase createOrder failed, using localStorage:', error?.message);
        const localOrder: Order = {
          ...orderData,
          id: 'ORD-' + crypto.randomUUID().substring(0, 6).toUpperCase(),
          date: new Date().toISOString(),
          status: 'pending'
        };
        const updated = [localOrder, ...this.orders()];
        this.saveOrdersLocal(updated);
        this.orders.set(updated);
        
        // Decrement inventory locally
        this.decrementInventory(orderData.items);
        
        return localOrder;
      }
      
      // Decrement inventory
      this.decrementInventory(orderData.items);
      
      await this.loadOrders();
      return data;
    } catch (err) {
      console.error('Error creating order:', err);
      return null;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    try {
      const { error } = await this.supabase.updateOrderStatus(id, status);
      
      if (error) {
        console.warn('Supabase updateOrderStatus failed, using localStorage:', error.message);
      }
      
      const updated = this.orders().map(o => o.id === id ? { ...o, status } : o);
      this.saveOrdersLocal(updated);
      this.orders.set(updated);
    } catch (err) {
      console.error('Error updating order status:', err);
      const updated = this.orders().map(o => o.id === id ? { ...o, status } : o);
      this.saveOrdersLocal(updated);
      this.orders.set(updated);
    }
  }

  // ============================================
  // CUSTOMER OPERATIONS
  // ============================================

  /**
   * Delete a customer (admin only)
   */
  async deleteCustomer(id: string): Promise<void> {
    // Note: In a real app, you'd call a Supabase function or admin API
    // For now, just update locally
    const updated = this.customers().filter(c => c.id !== id);
    this.saveCustomersLocal(updated);
    this.customers.set(updated);
  }

  /**
   * Add a new customer (admin only)
   */
  async addCustomer(customer: {
    name: string;
    email: string;
    phone?: string;
    shippingAddress?: string;
  }): Promise<Customer> {
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      shippingAddress: customer.shippingAddress,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=random`,
      joinDate: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: new Date().toISOString(),
      status: 'new'
    };

    const updated = [newCustomer, ...this.customers()];
    this.saveCustomersLocal(updated);
    this.customers.set(updated);
    
    return newCustomer;
  }

  // ============================================
  // IMAGE UPLOAD
  // ============================================

  /**
   * Upload a product image to Supabase Storage
   */
  async uploadProductImage(file: File): Promise<string | null> {
    const { url, error } = await this.supabase.uploadProductImage(file);
    
    if (error) {
      console.error('Error uploading image:', error.message);
      return null;
    }
    
    return url;
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private saveProductsLocal(products: Product[]): void {
    localStorage.setItem('lumina_products', JSON.stringify(products));
  }

  private saveOrdersLocal(orders: Order[]): void {
    localStorage.setItem('lumina_orders', JSON.stringify(orders));
  }

  private saveCustomersLocal(customers: Customer[]): void {
    localStorage.setItem('lumina_customers', JSON.stringify(customers));
  }

  private decrementInventory(items: CartItem[]): void {
    const currentProducts = [...this.products()];
    items.forEach(item => {
      const idx = currentProducts.findIndex(p => p.id === item.id);
      if (idx !== -1) {
        currentProducts[idx] = {
          ...currentProducts[idx],
          inventory: Math.max(0, currentProducts[idx].inventory - item.quantity)
        };
      }
    });
    this.saveProductsLocal(currentProducts);
    this.products.set(currentProducts);
  }

  // ============================================
  // LEGACY METHODS (for backward compatibility)
  // ============================================

  /** @deprecated Use addProduct instead */
  saveProducts(products: Product[]): void {
    this.saveProductsLocal(products);
    this.products.set(products);
  }

  /** @deprecated Use createOrder/updateOrderStatus instead */
  saveOrders(orders: Order[]): void {
    this.saveOrdersLocal(orders);
    this.orders.set(orders);
  }

  /** @deprecated Use Supabase admin functions */
  saveCustomers(customers: Customer[]): void {
    this.saveCustomersLocal(customers);
    this.customers.set(customers);
  }
}
