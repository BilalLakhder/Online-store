/**
 * CartItem - Lean representation of a product in the cart
 * Only stores essential fields for display and persistence
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  // Sale info for display
  isSale?: boolean;
  salePrice?: number;
}
