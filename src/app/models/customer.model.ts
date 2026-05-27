export type CustomerStatus = 'active' | 'inactive' | 'new';

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: CustomerStatus;
  phone?: string;
  shippingAddress?: string;
}

/**
 * Maps a Supabase profile row to the frontend Customer interface.
 * Note: This combines profile data with aggregated order stats.
 */
export function mapSupabaseProfile(row: any, orderStats?: { totalOrders: number; totalSpent: number; lastOrderDate: string }): Customer {
  return {
    id: row.id,
    name: row.full_name ?? '',
    email: row.email ?? '',
    avatar: row.avatar_url ?? `https://i.pravatar.cc/150?u=${row.id}`,
    joinDate: row.created_at,
    totalOrders: orderStats?.totalOrders ?? 0,
    totalSpent: orderStats?.totalSpent ?? 0,
    lastOrderDate: orderStats?.lastOrderDate ?? row.created_at,
    status: determineCustomerStatus(row.created_at, orderStats?.lastOrderDate),
    phone: row.phone,
    shippingAddress: row.shipping_address
  };
}

function determineCustomerStatus(joinDate: string, lastOrderDate?: string): CustomerStatus {
  const now = new Date();
  const joined = new Date(joinDate);
  const daysSinceJoined = Math.floor((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceJoined < 30) {
    return 'new';
  }
  
  if (lastOrderDate) {
    const lastOrder = new Date(lastOrderDate);
    const daysSinceOrder = Math.floor((now.getTime() - lastOrder.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceOrder < 90 ? 'active' : 'inactive';
  }
  
  return 'inactive';
}
