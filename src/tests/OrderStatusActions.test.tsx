import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderStatusActions } from '@/features/florist/components/order/OrderStatusActions';
import { OrderStatus } from '@/types/order';

describe('OrderStatusActions', () => {
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    mockOnStatusChange.mockClear();
  });

  describe('Delivery Order Flow', () => {
    it('should show correct actions for pending delivery order', () => {
      render(
        <OrderStatusActions
          status="pending"
          deliveryType="delivery"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('Confirm Order')).toBeInTheDocument();
      expect(screen.getByText('Cancel Order')).toBeInTheDocument();
      expect(screen.queryByText('Ready for Pickup')).not.toBeInTheDocument();
    });

    it('should show correct actions for confirmed delivery order', () => {
      render(
        <OrderStatusActions
          status="confirmed"
          deliveryType="delivery"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('Start Preparing')).toBeInTheDocument();
      expect(screen.queryByText('Ready for Pickup')).not.toBeInTheDocument();
    });

    it('should show correct actions for preparing delivery order', () => {
      render(
        <OrderStatusActions
          status="preparing"
          deliveryType="delivery"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('Ready for Delivery')).toBeInTheDocument();
      expect(screen.queryByText('Ready for Pickup')).not.toBeInTheDocument();
    });
  });

  describe('Pickup Order Flow', () => {
    it('should show correct actions for pending pickup order', () => {
      render(
        <OrderStatusActions
          status="pending"
          deliveryType="pickup"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('Confirm Order')).toBeInTheDocument();
      expect(screen.queryByText('Ready for Delivery')).not.toBeInTheDocument();
    });

    it('should show correct actions for preparing pickup order', () => {
      render(
        <OrderStatusActions
          status="preparing"
          deliveryType="pickup"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('Ready for Pickup')).toBeInTheDocument();
      expect(screen.queryByText('Ready for Delivery')).not.toBeInTheDocument();
      expect(screen.queryByText('Out for Delivery')).not.toBeInTheDocument();
    });
  });

  describe('Status Change Handling', () => {
    it('should require confirmation for cancellation', async () => {
      render(
        <OrderStatusActions
          status="confirmed"
          deliveryType="delivery"
          onStatusChange={mockOnStatusChange}
        />
      );

      fireEvent.click(screen.getByText('Cancel Order'));
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Confirm'));
      expect(mockOnStatusChange).toHaveBeenCalledWith('cancelled', '');
    });

    it('should allow adding notes when changing status', () => {
      render(
        <OrderStatusActions
          status="confirmed"
          deliveryType="delivery"
          onStatusChange={mockOnStatusChange}
        />
      );

      fireEvent.click(screen.getByText('Start Preparing'));
      
      const notesInput = screen.getByPlaceholderText('Add any notes about this status change...');
      fireEvent.change(notesInput, { target: { value: 'Test notes' } });
      
      fireEvent.click(screen.getByText('Update Status'));
      expect(mockOnStatusChange).toHaveBeenCalledWith('preparing', 'Test notes');
    });
  });

  describe('Final States', () => {
    it('should not show any actions for delivered orders', () => {
      render(
        <OrderStatusActions
          status="delivered"
          deliveryType="delivery"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not show any actions for picked up orders', () => {
      render(
        <OrderStatusActions
          status="picked_up"
          deliveryType="pickup"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not show any actions for cancelled orders', () => {
      render(
        <OrderStatusActions
          status="cancelled"
          deliveryType="delivery"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
}); 