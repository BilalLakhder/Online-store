import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ThemeService } from './theme.service';

export interface SeoMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private meta = inject(Meta);
  private title = inject(Title);
  private theme = inject(ThemeService);

  /**
   * Update page meta tags for SEO
   */
  updateMeta(seo: SeoMetadata): void {
    const brandName = this.theme.theme().brandName;
    
    // Title
    if (seo.title) {
      this.title.setTitle(`${seo.title} | ${brandName}`);
      this.meta.updateTag({ property: 'og:title', content: seo.title });
      this.meta.updateTag({ name: 'twitter:title', content: seo.title });
    }

    // Description
    if (seo.description) {
      this.meta.updateTag({ name: 'description', content: seo.description });
      this.meta.updateTag({ property: 'og:description', content: seo.description });
      this.meta.updateTag({ name: 'twitter:description', content: seo.description });
    }

    // Keywords
    if (seo.keywords?.length) {
      this.meta.updateTag({ name: 'keywords', content: seo.keywords.join(', ') });
    }

    // Open Graph Image
    if (seo.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: seo.ogImage });
      this.meta.updateTag({ name: 'twitter:image', content: seo.ogImage });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    }

    // OG Type
    if (seo.ogType) {
      this.meta.updateTag({ property: 'og:type', content: seo.ogType });
    }

    // Canonical URL
    if (seo.canonicalUrl) {
      this.updateCanonical(seo.canonicalUrl);
    }

    // Robots
    if (seo.noIndex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }

    // Structured Data (JSON-LD)
    if (seo.structuredData) {
      this.updateStructuredData(seo.structuredData);
    }
  }

  /**
   * Set product-specific structured data
   */
  setProductMeta(product: {
    name: string;
    description: string;
    price: number;
    currency?: string;
    imageUrl: string;
    sku?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    rating?: number;
    reviewCount?: number;
  }): void {
    const brandName = this.theme.theme().brandName;
    
    this.updateMeta({
      title: product.name,
      description: product.description.substring(0, 160),
      ogImage: product.imageUrl,
      ogType: 'product',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.imageUrl,
        sku: product.sku,
        brand: {
          '@type': 'Brand',
          name: brandName
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency ?? 'USD',
          availability: `https://schema.org/${product.availability ?? 'InStock'}`
        },
        ...(product.rating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount ?? 0
          }
        })
      }
    });
  }

  /**
   * Set category/collection page meta
   */
  setCategoryMeta(category: string, description?: string): void {
    const brandName = this.theme.theme().brandName;
    
    this.updateMeta({
      title: `${category} Collection`,
      description: description ?? `Browse our ${category} collection at ${brandName}`,
      ogType: 'website'
    });
  }

  /**
   * Reset to default meta
   */
  resetMeta(): void {
    const brandName = this.theme.theme().brandName;
    
    this.title.setTitle(brandName);
    this.meta.updateTag({ name: 'description', content: `Welcome to ${brandName} - Premium products for modern living` });
    this.meta.updateTag({ property: 'og:title', content: brandName });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.removeTag("property='og:image'");
    this.removeStructuredData();
  }

  /**
   * Update canonical URL
   */
  private updateCanonical(url: string): void {
    let link = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  /**
   * Add/update JSON-LD structured data
   */
  private updateStructuredData(data: Record<string, any>): void {
    this.removeStructuredData();
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'structured-data';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Remove structured data script
   */
  private removeStructuredData(): void {
    const existing = document.getElementById('structured-data');
    if (existing) {
      existing.remove();
    }
  }
}
