import { Json } from './database';

export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'picked_up'
  | 'cancelled';

export type DeliveryType = 'delivery' | 'pickup';

export interface OrderItemsTable {
  Row: {
    id: string;
    order_id: string;
    product_id: string;
    product_size_id?: string;
    quantity: number;
    price_at_time: number;
    customizations: Json;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    order_id: string;
    product_id: string;
    product_size_id?: string;
    quantity: number;
    price_at_time: number;
    customizations?: Json;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<OrderItemsTable['Insert']>;
}

export interface OrderStatusHistoryTable {
  Row: {
    id: string;
    order_id: string;
    status: OrderStatus;
    notes?: string;
    created_at: string;
    created_by: string;
  };
  Insert: {
    id?: string;
    order_id: string;
    status: OrderStatus;
    notes?: string;
    created_at?: string;
    created_by: string;
  };
  Update: Partial<OrderStatusHistoryTable['Insert']>;
}

export interface OrdersTable {
  Row: {
    id: string;
    florist_id: string;
    customer_id: string;
    status: OrderStatus;
    subtotal: number;
    delivery_fee: number;
    total: number;
    delivery_type: DeliveryType;
    delivery_address?: Json;
    delivery_instructions?: string;
    delivery_date?: string;
    delivery_time_slot?: string;
    customer_notes?: string;
    internal_notes?: string;
    metadata: Json;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    florist_id: string;
    customer_id: string;
    status?: OrderStatus;
    subtotal: number;
    delivery_fee: number;
    total: number;
    delivery_type: DeliveryType;
    delivery_address?: Json;
    delivery_instructions?: string;
    delivery_date?: string;
    delivery_time_slot?: string;
    customer_notes?: string;
    internal_notes?: string;
    metadata?: Json;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<OrdersTable['Insert']>;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  customizations?: Record<string, any>;
  product: {
    name: string;
    image: string;
  };
}

export interface Order {
  id: string;
  florist_id: string;
  customer_id: string;
  status: OrderStatus;
  delivery_type: DeliveryType;
  recipient_name: string;
  recipient_phone: string;
  delivery_address?: Json;
  delivery_instructions?: string;
  delivery_date: string;
  delivery_fee: number;
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  customer: {
    full_name: string;
    email: string;
  };
  status_history: {
    status: OrderStatus;
    notes?: string;
    created_at: string;
    created_by: string;
  }[];
}
