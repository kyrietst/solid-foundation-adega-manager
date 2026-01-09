export interface DeliveryOrder {
  id: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
  } | null;
  total_amount: number;
  delivery_fee: number;
  discount_amount: number;
  final_amount: number;
  delivery_status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  delivery_address: any;
  delivery_instructions?: string;
  estimated_delivery_time?: string;
  delivery_started_at?: string;
  delivery_completed_at?: string;
  delivery_person?: {
    id: string;
    name: string;
  } | null;
  delivery_zone?: {
    id: string;
    name: string;
  } | null;
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  tracking: Array<{
    id: string;
    status: string;
    notes: string;
    created_at: string;
    created_by_name?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface DeliveryMetrics {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalDeliveryFees: number;
  avgDeliveryTime: number;
  onTimeRate: number;
  // Novas métricas financeiras
  avgOrderValue: number;
  avgTicketWithDelivery: number;
  deliveryFeeRevenue: number;
  revenueGrowthRate: number;
  topZoneRevenue: {
    zoneName: string;
    revenue: number;
    orderCount: number;
  } | null;
}