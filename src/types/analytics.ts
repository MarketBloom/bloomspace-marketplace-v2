import { Json } from './database';

export interface AnalyticsDailyTable {
  Row: {
    id: string;
    florist_id: string;
    date: string;
    total_orders: number;
    total_revenue: number;
    total_items_sold: number;
    average_order_value: number;
    delivery_orders: number;
    pickup_orders: number;
    cancelled_orders: number;
    popular_products: Json;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    florist_id: string;
    date: string;
    total_orders?: number;
    total_revenue?: number;
    total_items_sold?: number;
    average_order_value?: number;
    delivery_orders?: number;
    pickup_orders?: number;
    cancelled_orders?: number;
    popular_products?: Json;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<AnalyticsDailyTable['Insert']>;
}

export interface PopularProduct {
  id: string;
  name: string;
  quantitySold: number;
}

export interface DailyAnalytics {
  id: string;
  floristId: string;
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalItemsSold: number;
  averageOrderValue: number;
  deliveryOrders: number;
  pickupOrders: number;
  cancelledOrders: number;
  popularProducts: PopularProduct[];
  createdAt: string;
  updatedAt: string;
}

// Helper function to transform database row to frontend model
export function transformAnalytics(row: AnalyticsDailyTable['Row']): DailyAnalytics {
  return {
    id: row.id,
    floristId: row.florist_id,
    date: row.date,
    totalOrders: row.total_orders,
    totalRevenue: row.total_revenue,
    totalItemsSold: row.total_items_sold,
    averageOrderValue: row.average_order_value,
    deliveryOrders: row.delivery_orders,
    pickupOrders: row.pickup_orders,
    cancelledOrders: row.cancelled_orders,
    popularProducts: (row.popular_products as any[]).map(p => ({
      id: p.id,
      name: p.name,
      quantitySold: p.quantity_sold
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Analytics time periods
export type AnalyticsPeriod = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

// Analytics metrics for charts
export interface MetricDataPoint {
  date: string;
  value: number;
}

export interface AnalyticsMetrics {
  revenue: MetricDataPoint[];
  orders: MetricDataPoint[];
  averageOrderValue: MetricDataPoint[];
  itemsSold: MetricDataPoint[];
}

// Analytics filters
export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  period?: AnalyticsPeriod;
  includeDelivery?: boolean;
  includePickup?: boolean;
  excludeCancelled?: boolean;
}
