import { OrderStatus } from '@/types/order';

// Define valid status transitions
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_delivery', 'ready_for_pickup', 'cancelled'],
  ready_for_delivery: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  ready_for_pickup: ['picked_up', 'cancelled'],
  picked_up: [],
  cancelled: [],
  refunded: []
};

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  deliveryType: 'delivery' | 'pickup'
): { valid: boolean; reason?: string } {
  // Get valid next statuses
  const validNextStatuses = STATUS_TRANSITIONS[currentStatus];

  // Check if transition is allowed
  if (!validNextStatuses.includes(newStatus)) {
    return {
      valid: false,
      reason: `Cannot transition from ${currentStatus} to ${newStatus}`
    };
  }

  // Validate delivery type specific transitions
  if (deliveryType === 'delivery' && newStatus === 'ready_for_pickup') {
    return {
      valid: false,
      reason: 'Cannot set delivery order to ready for pickup'
    };
  }

  if (deliveryType === 'pickup' && 
    ['ready_for_delivery', 'out_for_delivery', 'delivered'].includes(newStatus)) {
    return {
      valid: false,
      reason: 'Cannot set pickup order to delivery status'
    };
  }

  return { valid: true };
}

/**
 * Get available next statuses for an order
 */
export function getAvailableStatuses(
  currentStatus: OrderStatus,
  deliveryType: 'delivery' | 'pickup'
): OrderStatus[] {
  const validNextStatuses = STATUS_TRANSITIONS[currentStatus];
  
  return validNextStatuses.filter(status => {
    if (deliveryType === 'delivery') {
      return status !== 'ready_for_pickup' && status !== 'picked_up';
    }
    if (deliveryType === 'pickup') {
      return !['ready_for_delivery', 'out_for_delivery', 'delivered'].includes(status);
    }
    return true;
  });
}

/**
 * Check if an order can be cancelled
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return STATUS_TRANSITIONS[status].includes('cancelled');
}

/**
 * Check if an order status is final (no more transitions possible)
 */
export function isFinalStatus(status: OrderStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0;
}

/**
 * Get the appropriate status based on delivery type
 */
export function getReadyStatus(deliveryType: 'delivery' | 'pickup'): OrderStatus {
  return deliveryType === 'delivery' ? 'ready_for_delivery' : 'ready_for_pickup';
}

/**
 * Get the appropriate completed status based on delivery type
 */
export function getCompletedStatus(deliveryType: 'delivery' | 'pickup'): OrderStatus {
  return deliveryType === 'delivery' ? 'delivered' : 'picked_up';
} 