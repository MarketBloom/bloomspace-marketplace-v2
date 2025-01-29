export interface FloristProfile {
  id: string;
  user_id: string;
  store_name: string;
  store_status: 'pending' | 'active' | 'suspended';
  operating_hours: OperatingHours;
  delivery_settings: DeliverySettings;
  metadata?: Record<string, unknown>;
}

export interface OperatingHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export interface DeliverySettings {
  radius: number;
  minimum_order: number;
  fee: number;
  zones: DeliveryZone[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  minimum_order: number;
  coordinates: [number, number][];
} 