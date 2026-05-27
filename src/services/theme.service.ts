import { Injectable, signal, effect, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface ColorPalette {
  id: string;
  name: string;
  preview: string[]; // Preview colors for the palette card
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
}

// Professionally designed color palettes
export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'indigo',
    name: 'Indigo Elegance',
    preview: ['#4f46e5', '#0f172a', '#f59e0b'],
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    secondary: '#0f172a',
    accent: '#f59e0b'
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    preview: ['#059669', '#1e293b', '#fbbf24'],
    primary: '#059669',
    primaryHover: '#047857',
    secondary: '#1e293b',
    accent: '#fbbf24'
  },
  {
    id: 'rose',
    name: 'Rose Blush',
    preview: ['#e11d48', '#18181b', '#fcd34d'],
    primary: '#e11d48',
    primaryHover: '#be123c',
    secondary: '#18181b',
    accent: '#fcd34d'
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    preview: ['#7c3aed', '#1e1b4b', '#34d399'],
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    secondary: '#1e1b4b',
    accent: '#34d399'
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    preview: ['#d97706', '#292524', '#06b6d4'],
    primary: '#d97706',
    primaryHover: '#b45309',
    secondary: '#292524',
    accent: '#06b6d4'
  },
  {
    id: 'slate',
    name: 'Modern Slate',
    preview: ['#475569', '#0f172a', '#f97316'],
    primary: '#475569',
    primaryHover: '#334155',
    secondary: '#0f172a',
    accent: '#f97316'
  },
  {
    id: 'teal',
    name: 'Ocean Teal',
    preview: ['#0d9488', '#134e4a', '#fb923c'],
    primary: '#0d9488',
    primaryHover: '#0f766e',
    secondary: '#134e4a',
    accent: '#fb923c'
  },
  {
    id: 'noir',
    name: 'Minimal Noir',
    preview: ['#171717', '#262626', '#fafafa'],
    primary: '#171717',
    primaryHover: '#262626',
    secondary: '#0a0a0a',
    accent: '#fafafa'
  },
  {
    id: 'sky',
    name: 'Sky Blue',
    preview: ['#0284c7', '#0c4a6e', '#facc15'],
    primary: '#0284c7',
    primaryHover: '#0369a1',
    secondary: '#0c4a6e',
    accent: '#facc15'
  },
  {
    id: 'fuchsia',
    name: 'Vibrant Fuchsia',
    preview: ['#c026d3', '#4a044e', '#22d3ee'],
    primary: '#c026d3',
    primaryHover: '#a21caf',
    secondary: '#4a044e',
    accent: '#22d3ee'
  }
];

export interface ThemeConfig {
  // Brand Identity
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  
  // Color Palette
  paletteId: string; // Reference to COLOR_PALETTES
  
  // Colors (derived from palette, but stored for consistency)
  primaryColor: string;
  primaryHoverColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Typography
  fontFamily: string;
  headingFontFamily: string;
  
  // Layout
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  
  // Footer
  footerText: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  
  // Contact
  supportEmail: string;
  phoneNumber?: string;
}

const DEFAULT_PALETTE = COLOR_PALETTES[0]; // Indigo Elegance

const DEFAULT_THEME: ThemeConfig = {
  brandName: 'Lumina',
  logoUrl: '',
  faviconUrl: '',
  paletteId: DEFAULT_PALETTE.id,
  primaryColor: DEFAULT_PALETTE.primary,
  primaryHoverColor: DEFAULT_PALETTE.primaryHover,
  secondaryColor: DEFAULT_PALETTE.secondary,
  accentColor: DEFAULT_PALETTE.accent,
  fontFamily: 'Inter, system-ui, sans-serif',
  headingFontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: 'lg',
  footerText: '© 2024 Lumina. All rights reserved.',
  socialLinks: {},
  supportEmail: 'support@lumina.com'
};

/**
 * Get a palette by ID
 */
export function getPaletteById(id: string): ColorPalette | undefined {
  return COLOR_PALETTES.find(p => p.id === id);
}

const BORDER_RADIUS_MAP: Record<ThemeConfig['borderRadius'], string> = {
  'none': '0',
  'sm': '0.25rem',
  'md': '0.375rem',
  'lg': '0.5rem',
  'full': '9999px'
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private supabase = inject(SupabaseService);
  
  private _theme = signal<ThemeConfig>(DEFAULT_THEME);
  private _isLoading = signal(false);
  
  readonly theme = this._theme.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  constructor() {
    // Load theme from localStorage first for instant display
    this.loadFromLocalStorage();
    
    // Then fetch from Supabase
    this.loadTheme();
    
    // Apply theme whenever it changes
    effect(() => {
      this.applyTheme(this._theme());
    });
  }

  /**
   * Apply theme variables to the document
   */
  private applyTheme(config: ThemeConfig): void {
    const root = document.documentElement;
    
    // Colors
    root.style.setProperty('--color-primary', config.primaryColor);
    root.style.setProperty('--color-primary-hover', config.primaryHoverColor);
    root.style.setProperty('--color-secondary', config.secondaryColor);
    root.style.setProperty('--color-accent', config.accentColor);
    
    // Convert hex to RGB for Tailwind opacity support
    root.style.setProperty('--color-primary-rgb', this.hexToRgb(config.primaryColor));
    
    // Typography
    root.style.setProperty('--font-family', config.fontFamily);
    root.style.setProperty('--font-family-heading', config.headingFontFamily);
    
    // Border radius
    root.style.setProperty('--border-radius', BORDER_RADIUS_MAP[config.borderRadius]);
    
    // Update document title
    document.title = config.brandName;
    
    // Update favicon if provided
    if (config.faviconUrl) {
      this.updateFavicon(config.faviconUrl);
    }
  }

  /**
   * Convert hex color to RGB string
   */
  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '79, 70, 229'; // Default indigo
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }

  /**
   * Update the favicon dynamically
   */
  private updateFavicon(url: string): void {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  /**
   * Load theme from localStorage for instant display
   */
  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('lumina_theme');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this._theme.set({ ...DEFAULT_THEME, ...parsed });
      } catch (e) {
        console.warn('Failed to parse stored theme');
      }
    }
  }

  /**
   * Load theme from Supabase
   */
  async loadTheme(): Promise<void> {
  this._isLoading.set(true);

  try {

    const { data, error } = await this.supabase.client
      .from('site_settings')
      .select('*')
      .eq('key', 'theme')
      .limit(1);

    console.log('SITE SETTINGS:', data, error);

    if (data && !error) {

      const config = {
  ...DEFAULT_THEME,
  ...data[0].value
};

      this._theme.set(config);

      localStorage.setItem(
        'lumina_theme',
        JSON.stringify(config)
      );
    }

  } catch (err) {

    console.warn(
      'Theme not found in database, using defaults'
    );

  } finally {
    this._isLoading.set(false);
  }
}

  /**
   * Save theme to Supabase (admin only)
   */
 async saveTheme(config: Partial<ThemeConfig>): Promise<{ error: Error | null }> {

  const newTheme = { ...this._theme(), ...config };

  try {

    const { error } = await this.supabase.client
      .from('site_settings')
      .insert({
        theme: JSON.stringify(newTheme)
      });

    if (error) {
      return { error: error as Error };
    }

    this._theme.set(newTheme);

    localStorage.setItem(
      'lumina_theme',
      JSON.stringify(newTheme)
    );

    return { error: null };

  } catch (err) {
    return { error: err as Error };
  }
}
  /**
   * Reset theme to defaults
   */
  async resetTheme(): Promise<void> {
    await this.saveTheme(DEFAULT_THEME);
  }

  /**
   * Preview theme without saving
   */
  previewTheme(config: Partial<ThemeConfig>): void {
    this.applyTheme({ ...this._theme(), ...config });
  }

  /**
   * Cancel preview and restore saved theme
   */
  cancelPreview(): void {
    this.applyTheme(this._theme());
  }
}
