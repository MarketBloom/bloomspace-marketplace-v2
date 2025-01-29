import { OrderStatus } from '@/types/order';

export interface OrderStatusConfig {
  status: OrderStatus;
  label: string;
  color: string;
  description: string;
}

export const ORDER_STATUS_CONFIG: OrderStatusConfig[] = [
  {
    status: 'pending',
    label: 'Pending',
    color: 'yellow',
    description: 'Order received but not yet confirmed',
  },
  {
    status: 'preparing',
    label: 'Preparing',
    color: 'blue',
    description: 'Order is being prepared',
  },
  {
    status: 'ready_for_pickup',
    label: 'Ready for Pickup',
    color: 'green',
    description: 'Order is ready for customer pickup',
  },
  {
    status: 'out_for_delivery',
    label: 'Out for Delivery',
    color: 'purple',
    description: 'Order is out for delivery',
  },
  {
    status: 'delivered',
    label: 'Delivered',
    color: 'green',
    description: 'Order has been delivered',
  },
  {
    status: 'picked_up',
    label: 'Picked Up',
    color: 'green',
    description: 'Order has been picked up by customer',
  },
  {
    status: 'cancelled',
    label: 'Cancelled',
    color: 'red',
    description: 'Order has been cancelled',
  },
];

export function getOrderStatusConfig(status: OrderStatus): OrderStatusConfig {
  return ORDER_STATUS_CONFIG.find((config) => config.status === status)!;
}

export function getNextOrderStatuses(currentStatus: OrderStatus): OrderStatus[] {
  switch (currentStatus) {
    case 'pending':
      return ['preparing', 'cancelled'];
    case 'preparing':
      return ['ready_for_pickup', 'out_for_delivery', 'cancelled'];
    case 'ready_for_pickup':
      return ['picked_up', 'cancelled'];
    case 'out_for_delivery':
      return ['delivered', 'cancelled'];
    case 'delivered':
    case 'picked_up':
    case 'cancelled':
      return [];
    default:
      return [];
  }
} 