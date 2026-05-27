import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService, UserProfile } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  
  // Derived state from SupabaseService
  readonly isLoggedIn = this.supabase.isAuthenticated;
  readonly isAdmin = this.supabase.isAdmin;
  readonly currentUser = this.supabase.currentUser;
  readonly userProfile = this.supabase.userProfile;
  readonly isInitialized = this.supabase.isInitialized;
  
  // Loading/error state for UI feedback
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);
  
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    // Sync with legacy localStorage for backward compatibility during migration
    effect(() => {
      if (this.isAdmin()) {
        localStorage.setItem('lumina_admin_session', 'true');
      } else {
        localStorage.removeItem('lumina_admin_session');
      }
    });
  }

  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, fullName?: string): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);
    
    try {
      const { user, error } = await this.supabase.signUp(email, password, fullName);
      
      if (error) {
        this._error.set(error.message);
        return false;
      }
      
      if (user) {
        // Supabase may require email confirmation
        // Check if session was created immediately
        if (this.supabase.isAuthenticated()) {
          this.router.navigate(['/']);
        }
        return true;
      }
      
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Sign in an existing user
   */
  async login(email: string, password: string): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);
    
    try {
      const { user, error } = await this.supabase.signIn(email, password);
      
      if (error) {
        this._error.set(error.message);
        return false;
      }
      
      if (user) {
        // Wait a tick for profile to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate based on role
        if (this.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
        return true;
      }
      
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Sign out the current user
   */
  async logout(): Promise<void> {
    this._isLoading.set(true);
    
    try {
      await this.supabase.signOut();
      this.router.navigate(['/']);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Request password reset email
   */
  async resetPassword(email: string): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);
    
    try {
      const { error } = await this.supabase.resetPassword(email);
      
      if (error) {
        this._error.set(error.message);
        return false;
      }
      
      return true;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Clear any error state
   */
  clearError(): void {
    this._error.set(null);
  }
}
