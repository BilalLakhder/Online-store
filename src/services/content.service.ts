import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
  overlayOpacity?: number;
}

export interface FeaturedSection {
  id: string;
  title: string;
  subtitle?: string;
  type: 'products' | 'categories' | 'banner' | 'testimonials';
  productIds?: string[];
  categories?: string[];
  bannerImage?: string;
  bannerLink?: string;
  enabled: boolean;
  order: number;
}

export interface AnnouncementBar {
  enabled: boolean;
  message: string;
  link?: string;
  backgroundColor: string;
  textColor: string;
}

export interface SiteContent {
  hero: HeroContent;
  sections: FeaturedSection[];
  announcement: AnnouncementBar;
}

const DEFAULT_CONTENT: SiteContent = {
  hero: {
    headline: 'Discover Premium Products',
    subheadline: 'Curated collection of modern essentials for elevated living',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    overlayOpacity: 0.4
  },
  sections: [
    {
      id: 'featured-products',
      title: 'Featured Products',
      subtitle: 'Our most popular items',
      type: 'products',
      productIds: [],
      enabled: true,
      order: 1
    },
    {
      id: 'new-arrivals',
      title: 'New Arrivals',
      subtitle: 'Fresh additions to our collection',
      type: 'products',
      productIds: [],
      enabled: true,
      order: 2
    }
  ],
  announcement: {
    enabled: false,
    message: 'Free shipping on orders over $100',
    backgroundColor: '#4f46e5',
    textColor: '#ffffff'
  }
};

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private supabase = inject(SupabaseService);
  
  private _content = signal<SiteContent>(DEFAULT_CONTENT);
  private _isLoading = signal(false);
  
  readonly content = this._content.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  
  // Convenience getters
  readonly hero = () => this._content().hero;
  readonly sections = () => this._content().sections.filter(s => s.enabled).sort((a, b) => a.order - b.order);
  readonly announcement = () => this._content().announcement;

  constructor() {
    this.loadFromLocalStorage();
    this.loadContent();
  }

  /**
   * Load content from localStorage for instant display
   */
  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('lumina_content');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this._content.set({ ...DEFAULT_CONTENT, ...parsed });
      } catch (e) {
        console.warn('Failed to parse stored content');
      }
    }
  }

  /**
   * Load content from Supabase
   */
  async loadContent(): Promise<void> {
    this._isLoading.set(true);
    
    try {
        const { data, error } = await this.supabase.client
            .from('site_settings')
            .select('value')
            .eq('key', 'content')
            .maybeSingle();

      if (data && !error) {
          const content = {
              ...DEFAULT_CONTENT,
              ...(data?.value ?? {})
          };
          console.log('CONTENT SETTINGS:', data, error);
        this._content.set(content);
        localStorage.setItem('lumina_content', JSON.stringify(content));
      }
    } catch (err) {
      console.warn('Content not found in database, using defaults');
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Save content to Supabase (admin only)
   */
  async saveContent(content: Partial<SiteContent>): Promise<{ error: Error | null }> {
    const newContent = { ...this._content(), ...content };
    
    try {
      const { error } = await this.supabase.client
        .from('site_settings')
        .upsert({
          key: 'content',
          value: newContent,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) {
        return { error: error as Error };
      }

      this._content.set(newContent);
      localStorage.setItem('lumina_content', JSON.stringify(newContent));
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  /**
   * Update hero section
   */
  async updateHero(hero: Partial<HeroContent>): Promise<{ error: Error | null }> {
    return this.saveContent({
      hero: { ...this._content().hero, ...hero }
    });
  }

  /**
   * Update announcement bar
   */
  async updateAnnouncement(announcement: Partial<AnnouncementBar>): Promise<{ error: Error | null }> {
    return this.saveContent({
      announcement: { ...this._content().announcement, ...announcement }
    });
  }

  /**
   * Add or update a section
   */
  async upsertSection(section: FeaturedSection): Promise<{ error: Error | null }> {
    const sections = this._content().sections;
    const index = sections.findIndex(s => s.id === section.id);
    
    if (index >= 0) {
      sections[index] = section;
    } else {
      sections.push(section);
    }
    
    return this.saveContent({ sections });
  }

  /**
   * Remove a section
   */
  async removeSection(sectionId: string): Promise<{ error: Error | null }> {
    const sections = this._content().sections.filter(s => s.id !== sectionId);
    return this.saveContent({ sections });
  }

  /**
   * Reorder sections
   */
  async reorderSections(sectionIds: string[]): Promise<{ error: Error | null }> {
    const sections = this._content().sections.map(section => ({
      ...section,
      order: sectionIds.indexOf(section.id) + 1
    }));
    
    return this.saveContent({ sections });
  }

  /**
   * Reset content to defaults
   */
  async resetContent(): Promise<void> {
    await this.saveContent(DEFAULT_CONTENT);
  }
}
