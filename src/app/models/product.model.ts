export interface SeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  images?: string[];
  inventory: number;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
  colors?: string[];
  sizes?: string[];
  createdAt?: string;
  // SEO
  slug?: string;
  seoMetadata?: SeoMetadata;
}

/**
 * Maps a Supabase product row to the frontend Product interface.
 * Handles snake_case to camelCase conversion.
 */
export function mapSupabaseProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    price: Number(row.price),
    category: row.category ?? '',
    imageUrl: row.image_url ?? '',
    images: row.images ?? [],
    inventory: row.inventory ?? 0,
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count ?? 0,
    isNew: row.is_new ?? false,
    isSale: row.is_sale ?? false,
    salePrice: row.sale_price ? Number(row.sale_price) : undefined,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    createdAt: row.created_at,
    slug: row.slug,
    seoMetadata: row.seo_metadata ? {
      metaTitle: row.seo_metadata.meta_title,
      metaDescription: row.seo_metadata.meta_description,
      keywords: row.seo_metadata.keywords,
      ogImage: row.seo_metadata.og_image,
      canonicalUrl: row.seo_metadata.canonical_url,
      noIndex: row.seo_metadata.no_index
    } : undefined
  };
}

/**
 * Maps a frontend Product to Supabase row format.
 * Handles camelCase to snake_case conversion.
 */
export function mapProductToSupabase(product: Partial<Product>): Record<string, any> {
  const row: Record<string, any> = {};
  
  if (product.name !== undefined) row.name = product.name;
  if (product.description !== undefined) row.description = product.description;
  if (product.price !== undefined) row.price = product.price;
  if (product.category !== undefined) row.category = product.category;
  if (product.imageUrl !== undefined) row.image_url = product.imageUrl;
  if (product.images !== undefined) row.images = product.images;
  if (product.inventory !== undefined) row.inventory = product.inventory;
  if (product.rating !== undefined) row.rating = product.rating;
  if (product.reviewCount !== undefined) row.review_count = product.reviewCount;
  if (product.isNew !== undefined) row.is_new = product.isNew;
  if (product.isSale !== undefined) row.is_sale = product.isSale;
  if (product.salePrice !== undefined) row.sale_price = product.salePrice;
  if (product.colors !== undefined) row.colors = product.colors;
  if (product.sizes !== undefined) row.sizes = product.sizes;
  if (product.slug !== undefined) row.slug = product.slug;
  if (product.seoMetadata !== undefined) {
    row.seo_metadata = {
      meta_title: product.seoMetadata.metaTitle,
      meta_description: product.seoMetadata.metaDescription,
      keywords: product.seoMetadata.keywords,
      og_image: product.seoMetadata.ogImage,
      canonical_url: product.seoMetadata.canonicalUrl,
      no_index: product.seoMetadata.noIndex
    };
  }
  
  return row;
}

/**
 * Generate a URL-friendly slug from product name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
