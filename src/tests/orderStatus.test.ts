import { describe, it, expect, vi } from 'vitest';
import { 
  isValidStatusTransition, 
  getAvailableStatuses,
  canCancelOrder,
  isFinalStatus,
  getReadyStatus,
  getCompletedStatus 
} from '@/utils/orderValidation';
import { OrderStatus } from '@/types/order';

describe('Order Status Management', () => {
  describe('isValidStatusTransition', () => {
    it('should allow valid delivery transitions', () => {
      expect(isValidStatusTransition('pending', 'confirmed', 'delivery').valid).toBe(true);
      expect(isValidStatusTransition('confirmed', 'preparing', 'delivery').valid).toBe(true);
      expect(isValidStatusTransition('preparing', 'ready_for_delivery', 'delivery').valid).toBe(true);
      expect(isValidStatusTransition('ready_for_delivery', 'out_for_delivery', 'delivery').valid).toBe(true);
      expect(isValidStatusTransition('out_for_delivery', 'delivered', 'delivery').valid).toBe(true);
    });

    it('should allow valid pickup transitions', () => {
      expect(isValidStatusTransition('pending', 'confirmed', 'pickup').valid).toBe(true);
      expect(isValidStatusTransition('confirmed', 'preparing', 'pickup').valid).toBe(true);
      expect(isValidStatusTransition('preparing', 'ready_for_pickup', 'pickup').valid).toBe(true);
      expect(isValidStatusTransition('ready_for_pickup', 'picked_up', 'pickup').valid).toBe(true);
    });

    it('should prevent invalid delivery type transitions', () => {
      expect(isValidStatusTransition('preparing', 'ready_for_pickup', 'delivery').valid).toBe(false);
      expect(isValidStatusTransition('preparing', 'ready_for_delivery', 'pickup').valid).toBe(false);
    });

    it('should allow cancellation from valid states', () => {
      expect(isValidStatusTransition('pending', 'cancelled', 'delivery').valid).toBe(true);
      expect(isValidStatusTransition('confirmed', 'cancelled', 'delivery').valid).toBe(true);
      expect(isValidStatusTransition('preparing', 'cancelled', 'delivery').valid).toBe(true);
    });
  });

  describe('getAvailableStatuses', () => {
    it('should return correct statuses for delivery orders', () => {
      const pendingStatuses = getAvailableStatuses('pending', 'delivery');
      expect(pendingStatuses).toContain('confirmed');
      expect(pendingStatuses).toContain('cancelled');
      expect(pendingStatuses).not.toContain('ready_for_pickup');

      const preparingStatuses = getAvailableStatuses('preparing', 'delivery');
      expect(preparingStatuses).toContain('ready_for_delivery');
      expect(preparingStatuses).not.toContain('ready_for_pickup');
    });

    it('should return correct statuses for pickup orders', () => {
      const preparingStatuses = getAvailableStatuses('preparing', 'pickup');
      expect(preparingStatuses).toContain('ready_for_pickup');
      expect(preparingStatuses).not.toContain('ready_for_delivery');
      expect(preparingStatuses).not.toContain('out_for_delivery');
    });
  });

  describe('canCancelOrder', () => {
    it('should allow cancellation from valid states', () => {
      expect(canCancelOrder('pending')).toBe(true);
      expect(canCancelOrder('confirmed')).toBe(true);
      expect(canCancelOrder('preparing')).toBe(true);
    });

    it('should prevent cancellation from final states', () => {
      expect(canCancelOrder('delivered')).toBe(false);
      expect(canCancelOrder('picked_up')).toBe(false);
      expect(canCancelOrder('cancelled')).toBe(false);
    });
  });

  describe('isFinalStatus', () => {
    it('should identify final statuses correctly', () => {
      expect(isFinalStatus('delivered')).toBe(true);
      expect(isFinalStatus('picked_up')).toBe(true);
      expect(isFinalStatus('cancelled')).toBe(true);
    });

    it('should identify non-final statuses correctly', () => {
      expect(isFinalStatus('pending')).toBe(false);
      expect(isFinalStatus('preparing')).toBe(false);
      expect(isFinalStatus('ready_for_delivery')).toBe(false);
    });
  });

  describe('getReadyStatus', () => {
    it('should return correct ready status based on delivery type', () => {
      expect(getReadyStatus('delivery')).toBe('ready_for_delivery');
      expect(getReadyStatus('pickup')).toBe('ready_for_pickup');
    });
  });

  describe('getCompletedStatus', () => {
    it('should return correct completed status based on delivery type', () => {
      expect(getCompletedStatus('delivery')).toBe('delivered');
      expect(getCompletedStatus('pickup')).toBe('picked_up');
    });
  });
}); 