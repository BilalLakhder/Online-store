import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemeService, ThemeConfig, COLOR_PALETTES, ColorPalette, getPaletteById } from '../../services/theme.service';
import { ContentService, HeroContent, AnnouncementBar } from '../../services/content.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-6 max-w-5xl">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Site Settings</h1>
      <p class="text-gray-500 mb-8">Customize your store's appearance and content</p>
      
      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-8">
        <nav class="flex space-x-8">
          @for (tab of tabs; track tab.id) {
            <button 
              (click)="activeTab.set(tab.id)"
              [class]="activeTab() === tab.id 
                ? 'border-primary-500 text-primary-600 border-b-2 py-3 px-1 text-sm font-medium' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 py-3 px-1 text-sm font-medium'"
            >
              {{ tab.label }}
            </button>
          }
        </nav>
      </div>

      <!-- Brand Settings -->
      @if (activeTab() === 'brand') {
        <div class="space-y-8">
          <!-- Brand Identity -->
          <div class="bg-white rounded-xl border p-6 shadow-sm">
            <h2 class="text-lg font-semibold mb-1">Brand Identity</h2>
            <p class="text-sm text-gray-500 mb-6">Your store's name and visual identity</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                <input type="text" [(ngModel)]="themeForm.brandName" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                <input type="email" [(ngModel)]="themeForm.supportEmail" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input type="url" [(ngModel)]="themeForm.logoUrl" placeholder="https://..."
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
                <input type="url" [(ngModel)]="themeForm.faviconUrl" placeholder="https://..."
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border">
              </div>
            </div>
            
            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
              <input type="text" [(ngModel)]="themeForm.footerText" 
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border">
            </div>
          </div>

          <!-- Color Palette Selection -->
          <div class="bg-white rounded-xl border p-6 shadow-sm">
            <h2 class="text-lg font-semibold mb-1">Color Theme</h2>
            <p class="text-sm text-gray-500 mb-6">Choose a professionally designed color palette for your store</p>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              @for (palette of palettes; track palette.id) {
                <button 
                  (click)="selectPalette(palette)"
                  [class]="selectedPaletteId() === palette.id 
                    ? 'ring-2 ring-primary-500 ring-offset-2' 
                    : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'"
                  class="relative rounded-xl border bg-white p-4 text-left transition-all focus:outline-none"
                >
                  <!-- Color Preview -->
                  <div class="flex gap-1 mb-3">
                    @for (color of palette.preview; track color) {
                      <div 
                        class="h-8 flex-1 first:rounded-l-lg last:rounded-r-lg"
                        [style.backgroundColor]="color"
                      ></div>
                    }
                  </div>
                  
                  <p class="text-sm font-medium text-gray-900">{{ palette.name }}</p>
                  
                  @if (selectedPaletteId() === palette.id) {
                    <div class="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                      <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  }
                </button>
              }
            </div>
            
            <!-- Live Preview -->
            <div class="mt-8 p-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Live Preview</p>
              <div class="flex items-center gap-4">
                <button 
                  class="px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
                  [style.backgroundColor]="themeForm.primaryColor"
                >
                  Primary Button
                </button>
                <button 
                  class="px-6 py-2.5 rounded-lg text-white font-medium text-sm"
                  [style.backgroundColor]="themeForm.secondaryColor"
                >
                  Secondary
                </button>
                <span 
                  class="px-4 py-2 rounded-full text-sm font-medium"
                  [style.backgroundColor]="themeForm.accentColor"
                  [style.color]="isLightColor(themeForm.accentColor) ? '#000' : '#fff'"
                >
                  Accent Badge
                </span>
              </div>
            </div>
          </div>

          <!-- Border Radius -->
          <div class="bg-white rounded-xl border p-6 shadow-sm">
            <h2 class="text-lg font-semibold mb-1">Corner Style</h2>
            <p class="text-sm text-gray-500 mb-6">Choose the roundness of buttons and cards</p>
            
            <div class="flex gap-3">
              @for (radius of radiusOptions; track radius.value) {
                <button 
                  (click)="themeForm.borderRadius = radius.value"
                  [class]="themeForm.borderRadius === radius.value 
                    ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200' 
                    : 'hover:bg-gray-50'"
                  class="flex flex-col items-center p-4 border rounded-xl transition-all"
                >
                  <div 
                    class="w-12 h-8 bg-gray-900 mb-2"
                    [style.borderRadius]="radius.preview"
                  ></div>
                  <span class="text-xs font-medium text-gray-700">{{ radius.label }}</span>
                </button>
              }
            </div>
          </div>

          <div class="flex gap-3">
            <button (click)="previewTheme()" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
              Preview
            </button>
            <button (click)="saveTheme()" [disabled]="isSaving()" 
              class="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-medium">
              {{ isSaving() ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      }

      <!-- Homepage Content -->
      @if (activeTab() === 'homepage') {
        <div class="space-y-8">
          <div class="bg-white rounded-xl border p-6 shadow-sm">
            <h2 class="text-lg font-semibold mb-1">Hero Section</h2>
            <p class="text-sm text-gray-500 mb-6">The main banner visitors see first</p>
            
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                <input type="text" [(ngModel)]="heroForm.headline" 
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border text-lg">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Subheadline</label>
                <textarea [(ngModel)]="heroForm.subheadline" rows="2"
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border"></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                  <input type="text" [(ngModel)]="heroForm.ctaText" 
                    class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                  <input type="text" [(ngModel)]="heroForm.ctaLink" 
                    class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
                <input type="url" [(ngModel)]="heroForm.backgroundImage" placeholder="https://..."
                  class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border">
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-lg font-semibold">Announcement Bar</h2>
                <p class="text-sm text-gray-500">Display a banner at the top of your store</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="announcementForm.enabled" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            @if (announcementForm.enabled) {
              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <input type="text" [(ngModel)]="announcementForm.message" 
                    placeholder="Free shipping on orders over $100"
                    class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Link (optional)</label>
                  <input type="text" [(ngModel)]="announcementForm.link" placeholder="/shop"
                    class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border">
                </div>
                
                <!-- Announcement Color Presets -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Style</label>
                  <div class="flex gap-3">
                    @for (preset of announcementPresets; track preset.name) {
                      <button 
                        (click)="applyAnnouncementPreset(preset)"
                        [class]="announcementForm.backgroundColor === preset.bg ? 'ring-2 ring-offset-2 ring-gray-400' : ''"
                        class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
                        [style.backgroundColor]="preset.bg"
                        [style.color]="preset.text"
                      >
                        <span class="text-sm font-medium">{{ preset.name }}</span>
                      </button>
                    }
                  </div>
                </div>
                
                <!-- Preview -->
                <div class="mt-4">
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Preview</p>
                  <div 
                    class="text-center py-2.5 px-4 text-sm font-medium rounded-lg"
                    [style.backgroundColor]="announcementForm.backgroundColor"
                    [style.color]="announcementForm.textColor"
                  >
                    {{ announcementForm.message || 'Your announcement message here' }}
                  </div>
                </div>
              </div>
            }
          </div>

          <button (click)="saveContent()" [disabled]="isSaving()" 
            class="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-medium">
            {{ isSaving() ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      }

      <!-- Social Links -->
      @if (activeTab() === 'social') {
        <div class="bg-white rounded-xl border p-6 shadow-sm">
          <h2 class="text-lg font-semibold mb-1">Social Media Links</h2>
          <p class="text-sm text-gray-500 mb-6">Connect your social profiles</p>
          
          <div class="space-y-5">
            @for (social of socialInputs; track social.key) {
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                  <span [innerHTML]="social.icon"></span>
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ social.label }}</label>
                  <input 
                    type="url" 
                    [ngModel]="themeForm.socialLinks[social.key]"
                    (ngModelChange)="themeForm.socialLinks[social.key] = $event"
                    [placeholder]="social.placeholder"
                    class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2.5 border">
                </div>
              </div>
            }
          </div>

          <button (click)="saveTheme()" [disabled]="isSaving()" 
            class="mt-8 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-medium">
            {{ isSaving() ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      }

      @if (saveMessage()) {
        <div 
          class="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up"
          [class]="saveMessage()!.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
        >
          @if (saveMessage()!.type === 'success') {
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          }
          {{ saveMessage()!.text }}
        </div>
      }
    </div>
  `
})
export class SettingsAdminComponent implements OnInit {
  private themeService = inject(ThemeService);
  private contentService = inject(ContentService);
  
  palettes = COLOR_PALETTES;
  
  tabs = [
    { id: 'brand', label: 'Brand & Theme' },
    { id: 'homepage', label: 'Homepage' },
    { id: 'social', label: 'Social Links' }
  ];
  
  radiusOptions = [
    { value: 'none' as const, label: 'Sharp', preview: '0' },
    { value: 'sm' as const, label: 'Subtle', preview: '4px' },
    { value: 'md' as const, label: 'Medium', preview: '8px' },
    { value: 'lg' as const, label: 'Rounded', preview: '12px' },
    { value: 'full' as const, label: 'Pill', preview: '9999px' }
  ];
  
  announcementPresets = [
    { name: 'Primary', bg: '#4f46e5', text: '#ffffff' },
    { name: 'Dark', bg: '#18181b', text: '#ffffff' },
    { name: 'Success', bg: '#059669', text: '#ffffff' },
    { name: 'Warning', bg: '#d97706', text: '#ffffff' },
    { name: 'Light', bg: '#f3f4f6', text: '#111827' }
  ];
  
  socialInputs = [
    { key: 'facebook' as const, label: 'Facebook', placeholder: 'https://facebook.com/yourpage', icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>' },
    { key: 'twitter' as const, label: 'Twitter / X', placeholder: 'https://twitter.com/yourhandle', icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
    { key: 'instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/yourprofile', icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>' },
    { key: 'linkedin' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany', icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' }
  ];
  
  activeTab = signal<string>('brand');
  selectedPaletteId = signal<string>('indigo');
  isSaving = signal(false);
  saveMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Theme form
  themeForm: ThemeConfig = {
    brandName: '',
    logoUrl: '',
    faviconUrl: '',
    paletteId: 'indigo',
    primaryColor: '#4f46e5',
    primaryHoverColor: '#4338ca',
    secondaryColor: '#0f172a',
    accentColor: '#f59e0b',
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 'lg',
    footerText: '',
    socialLinks: {},
    supportEmail: ''
  };
  
  // Hero form
  heroForm: HeroContent = {
    headline: '',
    subheadline: '',
    ctaText: '',
    ctaLink: '/shop'
  };
  
  // Announcement form
  announcementForm: AnnouncementBar = {
    enabled: false,
    message: '',
    backgroundColor: '#4f46e5',
    textColor: '#ffffff'
  };

  ngOnInit() {
    // Load current values
    const theme = this.themeService.theme();
    this.themeForm = { ...theme };
    this.selectedPaletteId.set(theme.paletteId || 'indigo');
    
    const content = this.contentService.content();
    this.heroForm = { ...content.hero };
    this.announcementForm = { ...content.announcement };
  }

  selectPalette(palette: ColorPalette) {
    this.selectedPaletteId.set(palette.id);
    this.themeForm.paletteId = palette.id;
    this.themeForm.primaryColor = palette.primary;
    this.themeForm.primaryHoverColor = palette.primaryHover;
    this.themeForm.secondaryColor = palette.secondary;
    this.themeForm.accentColor = palette.accent;
    
    // Update announcement preset to match new primary
    if (this.announcementForm.backgroundColor === '#4f46e5') {
      this.announcementForm.backgroundColor = palette.primary;
    }
  }

  applyAnnouncementPreset(preset: { bg: string; text: string }) {
    this.announcementForm.backgroundColor = preset.bg;
    this.announcementForm.textColor = preset.text;
  }

  isLightColor(color: string): boolean {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  }

  previewTheme() {
    this.themeService.previewTheme(this.themeForm);
  }

  async saveTheme() {
    this.isSaving.set(true);
    this.saveMessage.set(null);
    
    const { error } = await this.themeService.saveTheme(this.themeForm);
    
    this.isSaving.set(false);
    
    if (error) {
      this.saveMessage.set({ type: 'error', text: `Failed to save: ${error.message}` });
    } else {
      this.saveMessage.set({ type: 'success', text: 'Settings saved!' });
      setTimeout(() => this.saveMessage.set(null), 3000);
    }
  }

  async saveContent() {
    this.isSaving.set(true);
    this.saveMessage.set(null);
    
    const heroResult = await this.contentService.updateHero(this.heroForm);
    const announcementResult = await this.contentService.updateAnnouncement(this.announcementForm);
    
    this.isSaving.set(false);
    
    if (heroResult.error || announcementResult.error) {
      this.saveMessage.set({ type: 'error', text: 'Failed to save content' });
    } else {
      this.saveMessage.set({ type: 'success', text: 'Content saved!' });
      setTimeout(() => this.saveMessage.set(null), 3000);
    }
  }
}
