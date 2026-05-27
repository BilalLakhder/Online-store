import { CartItem } from './cart-item.model';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
  shippingAddress?: string;
  paymentIntentId?: string;
}

/**
 * Maps a Supabase order row to the frontend Order interface.
 */
export function mapSupabaseOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name ?? '',
    customerEmail: row.customer_email ?? '',
    items: row.items ?? [],
    total: Number(row.total),
    status: row.status ?? 'pending',
    date: row.created_at,
    shippingAddress: row.shipping_address,
    paymentIntentId: row.payment_intent_id
  };
}

/**
 * Maps a frontend Order to Supabase row format.
 */
export function mapOrderToSupabase(order: Partial<Order>): Record<string, any> {
  const row: Record<string, any> = {};
  
  if (order.userId !== undefined) row.user_id = order.userId;
  if (order.customerName !== undefined) row.customer_name = order.customerName;
  if (order.customerEmail !== undefined) row.customer_email = order.customerEmail;
  if (order.items !== undefined) row.items = order.items;
  if (order.total !== undefined) row.total = order.total;
  if (order.status !== undefined) row.status = order.status;
  if (order.shippingAddress !== undefined) row.shipping_address = order.shippingAddress;
  if (order.paymentIntentId !== undefined) row.payment_intent_id = order.paymentIntentId;
  
  return row;
}
