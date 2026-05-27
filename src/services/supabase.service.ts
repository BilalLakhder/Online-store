import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Product, mapSupabaseProduct, mapProductToSupabase } from '../app/models/product.model';
import { Order, mapSupabaseOrder, mapOrderToSupabase } from '../app/models/order.model';
import { Customer, mapSupabaseProfile } from '../app/models/customer.model';
import { CartItem } from '../app/models/cart-item.model';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin' | 'customer';
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  
  // Auth state
  private _currentUser = signal<User | null>(null);
  private _userProfile = signal<UserProfile | null>(null);
  private _isInitialized = signal(false);
  
  readonly currentUser = this._currentUser.asReadonly();
  readonly userProfile = this._userProfile.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._userProfile()?.role === 'admin');
  readonly isInitialized = this._isInitialized.asReadonly();

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
    
    this.initAuthListener();
  }

  private async initAuthListener() {
    // Get initial session
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      this._currentUser.set(session.user);
      await this.loadUserProfile(session.user.id);
    }
    this._isInitialized.set(true);

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      this._currentUser.set(session?.user ?? null);
      
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      } else {
        this._userProfile.set(null);
      }
    });
  }

  private async loadUserProfile(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading profile:', error.message);
      
      // Profile might not exist - try to create it
      if (error.code === 'PGRST116') {
        const user = this._currentUser();
        if (user) {
          console.log('Profile not found, creating one...');
          const { error: insertError } = await this.supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.['full_name'] ?? '',
              role: 'customer'
            });
          
          if (!insertError) {
            // Retry loading
            return this.loadUserProfile(userId);
          } else {
            console.error('Error creating profile:', insertError.message);
          }
        }
      }
      return;
    }

    if (data) {
      console.log('Profile loaded:', { id: data.id, email: data.email, role: data.role });
      this._userProfile.set({
        id: data.id,
        email: data.email,
        fullName: data.full_name ?? '',
        avatarUrl: data.avatar_url,
        role: data.role ?? 'customer'
      });
    }
  }

  // ============================================
  // AUTH METHODS
  // ============================================

  async signUp(email: string, password: string, fullName?: string): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (data.user && !error) {
      // Create profile entry
      await this.supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        role: 'customer'
      });
    }

    return { user: data.user, error: error as Error | null };
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    return { user: data.user, error: error as Error | null };
  }

  async signOut(): Promise<void> {
    // Sign out from Supabase (scope: 'global' signs out all tabs)
    await this.supabase.auth.signOut({ scope: 'global' });
    
    // Clear local state
    this._currentUser.set(null);
    this._userProfile.set(null);
    
    // Clear any cached auth data from localStorage
    localStorage.removeItem('lumina_admin_session');
    localStorage.removeItem('lumina_cart');
    
    // Clear Supabase's own storage (backup in case signOut doesn't clear it)
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    return { error: error as Error | null };
  }

  // ============================================
  // PRODUCTS
  // ============================================

  async getProducts(): Promise<{ data: Product[]; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error as Error };
    }

    return { 
      data: (data ?? []).map(mapSupabaseProduct), 
      error: null 
    };
  }

  async getProductById(id: string): Promise<{ data: Product | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { 
      data: data ? mapSupabaseProduct(data) : null, 
      error: null 
    };
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<{ data: Product | null; error: Error | null }> {
    const row = mapProductToSupabase(product);
    
    const { data, error } = await this.supabase
      .from('products')
      .insert(row)
      .select()
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { 
      data: data ? mapSupabaseProduct(data) : null, 
      error: null 
    };
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ data: Product | null; error: Error | null }> {
    const row = mapProductToSupabase(updates);
    
    const { data, error } = await this.supabase
      .from('products')
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { 
      data: data ? mapSupabaseProduct(data) : null, 
      error: null 
    };
  }

  async deleteProduct(id: string): Promise<{ error: Error | null }> {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);

    return { error: error as Error | null };
  }

  // ============================================
  // ORDERS
  // ============================================

  async getOrders(): Promise<{ data: Order[]; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error as Error };
    }

    return { 
      data: (data ?? []).map(mapSupabaseOrder), 
      error: null 
    };
  }

  async getOrdersByUser(userId: string): Promise<{ data: Order[]; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error as Error };
    }

    return { 
      data: (data ?? []).map(mapSupabaseOrder), 
      error: null 
    };
  }

  async createOrder(order: {
    userId?: string;
    customerName: string;
    customerEmail: string;
    items: CartItem[];
    total: number;
    shippingAddress?: string;
  }): Promise<{ data: Order | null; error: Error | null }> {
    const row = {
      user_id: order.userId,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      items: order.items,
      total: order.total,
      status: 'pending',
      shipping_address: order.shippingAddress
    };

    const { data, error } = await this.supabase
      .from('orders')
      .insert(row)
      .select()
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { 
      data: data ? mapSupabaseOrder(data) : null, 
      error: null 
    };
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<{ error: Error | null }> {
    const { error } = await this.supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    return { error: error as Error | null };
  }

  // ============================================
  // PROFILES / CUSTOMERS (Admin view)
  // ============================================

  async getCustomers(): Promise<{ data: Customer[]; error: Error | null }> {
    const { data: profiles, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileError) {
      return { data: [], error: profileError as Error };
    }

    // Fetch order stats for each customer
    const customers: Customer[] = [];
    for (const profile of profiles ?? []) {
      const { data: orders } = await this.supabase
        .from('orders')
        .select('total, created_at')
        .eq('user_id', profile.id);

      const orderStats = orders ? {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, o) => sum + Number(o.total), 0),
        lastOrderDate: orders.length > 0 
          ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : profile.created_at
      } : undefined;

      customers.push(mapSupabaseProfile(profile, orderStats));
    }

    return { data: customers, error: null };
  }

  // ============================================
  // STORAGE - Product Images
  // ============================================

  async uploadProductImage(file: File): Promise<{ url: string | null; error: Error | null }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      return { url: null, error: uploadError as Error };
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  }

  async deleteProductImage(url: string): Promise<{ error: Error | null }> {
    // Extract path from URL
    const path = url.split('/product-images/')[1];
    if (!path) {
      return { error: new Error('Invalid image URL') };
    }

    const { error } = await this.supabase.storage
      .from('product-images')
      .remove([path]);

    return { error: error as Error | null };
  }

  // ============================================
  // CART (Persistent for logged-in users)
  // ============================================

  async getCart(): Promise<{ items: CartItem[]; error: Error | null }> {
    const userId = this._currentUser()?.id;
    if (!userId) {
      return { items: [], error: null };
    }

    const { data, error } = await this.supabase
      .from('carts')
      .select('items')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { items: [], error: error as Error };
    }

    return { items: (data?.items as CartItem[]) ?? [], error: null };
  }

  async saveCart(items: CartItem[]): Promise<{ error: Error | null }> {
    const userId = this._currentUser()?.id;
    if (!userId) {
      return { error: null }; // Not logged in, skip
    }

    const { error } = await this.supabase
      .from('carts')
      .upsert({
        user_id: userId,
        items,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    return { error: error as Error | null };
  }

  async clearCart(): Promise<{ error: Error | null }> {
    const userId = this._currentUser()?.id;
    if (!userId) {
      return { error: null };
    }

    const { error } = await this.supabase
      .from('carts')
      .delete()
      .eq('user_id', userId);

    return { error: error as Error | null };
  }

  // ============================================
  // NEWSLETTER
  // ============================================

  async subscribeNewsletter(email: string): Promise<{ success: boolean; error: Error | null }> {
    const { error } = await this.supabase
      .from('newsletter_subscribers')
      .insert({ email, source: 'website' });

    if (error) {
      // Check for duplicate
      if (error.code === '23505') {
        return { success: true, error: null }; // Already subscribed, still success
      }
      return { success: false, error: error as Error };
    }

    return { success: true, error: null };
  }

  async getNewsletterSubscribers(): Promise<{ data: { email: string; subscribedAt: string }[]; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('newsletter_subscribers')
      .select('email, subscribed_at')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false });

    if (error) {
      return { data: [], error: error as Error };
    }

    return {
      data: (data ?? []).map(s => ({
        email: s.email,
        subscribedAt: s.subscribed_at
      })),
      error: null
    };
  }

  // ============================================
  // RAW CLIENT ACCESS (for advanced queries)
  // ============================================

  get client(): SupabaseClient {
    return this.supabase;
  }
}
