export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface FloristProfile extends BaseEntity {
  user_id: string;
  store_name: string;
  store_status: 'pending' | 'active' | 'suspended';
  operating_hours: OperatingHours;
  delivery_settings: DeliverySettings;
  metadata?: Record<string, unknown>;
}

export interface Order extends BaseEntity {
  customer_id: string;
  florist_id: string;
  status: OrderStatus;
  items: OrderItem[];
  delivery_details: DeliveryDetails;
  payment_status: PaymentStatus;
  metadata?: Record<string, unknown>;
}

// ... more type definitions 