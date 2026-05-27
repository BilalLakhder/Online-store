import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 h-screen">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {{ isSignUp() ? 'Create your account' : 'Sign in to your account' }}
        </h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" (ngSubmit)="onSubmit()">
          @if (isSignUp()) {
            <div>
              <label for="name" class="block text-sm font-medium leading-6 text-gray-900">Full Name</label>
              <div class="mt-2">
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  autocomplete="name" 
                  required 
                  [(ngModel)]="name" 
                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="John Doe"
                >
              </div>
            </div>
          }

          <div>
            <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email address</label>
            <div class="mt-2">
              <input 
                id="email" 
                name="email" 
                type="email" 
                autocomplete="email" 
                required 
                [(ngModel)]="email" 
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                placeholder="you@example.com"
              >
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium leading-6 text-gray-900">Password</label>
              @if (!isSignUp()) {
                <div class="text-sm">
                  <button type="button" (click)="forgotPassword()" class="font-semibold text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </button>
                </div>
              }
            </div>
            <div class="mt-2">
              <input 
                id="password" 
                name="password" 
                type="password" 
                [autocomplete]="isSignUp() ? 'new-password' : 'current-password'" 
                required 
                [(ngModel)]="password"
                minlength="6"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                placeholder="••••••••"
              >
            </div>
            @if (isSignUp()) {
              <p class="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            }
          </div>

          @if (auth.error()) {
            <div class="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {{ auth.error() }}
            </div>
          }

          @if (successMessage()) {
            <div class="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {{ successMessage() }}
            </div>
          }

          <div>
            <button 
              type="submit" 
              [disabled]="auth.isLoading()"
              class="flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (auth.isLoading()) {
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSignUp() ? 'Creating account...' : 'Signing in...' }}
              } @else {
                {{ isSignUp() ? 'Create account' : 'Sign in' }}
              }
            </button>
          </div>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          {{ isSignUp() ? 'Already have an account?' : "Don't have an account?" }}
          <button 
            type="button"
            (click)="toggleMode()" 
            class="font-semibold leading-6 text-primary-600 hover:text-primary-500 ml-1"
          >
            {{ isSignUp() ? 'Sign in' : 'Sign up' }}
          </button>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  
  isSignUp = signal(false);
  successMessage = signal<string | null>(null);
  
  name = '';
  email = '';
  password = '';

  toggleMode() {
    this.isSignUp.update(v => !v);
    this.auth.clearError();
    this.successMessage.set(null);
  }

  async onSubmit() {
    this.successMessage.set(null);
    
    if (this.isSignUp()) {
      const success = await this.auth.signUp(this.email, this.password, this.name);
      if (success) {
        this.successMessage.set('Account created! Check your email to confirm, or sign in if email confirmation is disabled.');
        this.isSignUp.set(false);
        this.password = '';
      }
    } else {
      await this.auth.login(this.email, this.password);
    }
  }

  async forgotPassword() {
    if (!this.email) {
      alert('Please enter your email address first');
      return;
    }
    
    const success = await this.auth.resetPassword(this.email);
    if (success) {
      this.successMessage.set('Password reset email sent! Check your inbox.');
    }
  }
}
