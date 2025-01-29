import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { useOrders, useUpdateOrderStatus } from '@/hooks/api/useOrders';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { OrderStatus } from '@/types/order';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { status: 'pending' },
            error: null
          }))
        })),
        or: vi.fn(),
        gte: vi.fn(),
        lte: vi.fn(),
        order: vi.fn()
      })) as unknown as PostgrestFilterBuilder<any, any, any>,
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    })),
    rpc: vi.fn(() => ({
      data: { status: 'confirmed' },
      error: null
    }))
  }
}));

describe('Order Management Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
  });

  const createWrapper = () => {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    };
  };

  describe('useUpdateOrderStatus', () => {
    it('should successfully update order status', async () => {
      const { result } = renderHook(() => useUpdateOrderStatus(), {
        wrapper: createWrapper()
      });

      await result.current.mutateAsync({
        orderId: 'test-order-id',
        status: 'confirmed' as OrderStatus,
        deliveryType: 'delivery'
      });

      expect(supabase.rpc).toHaveBeenCalledWith(
        'update_order_status',
        expect.objectContaining({
          p_order_id: 'test-order-id',
          p_status: 'confirmed'
        })
      );
    });

    it('should handle invalid status transitions', async () => {
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { status: 'delivered' },
              error: null
            }))
          }))
        }))
      }));

      vi.mocked(supabase.from).mockImplementationOnce(mockFrom);

      const { result } = renderHook(() => useUpdateOrderStatus(), {
        wrapper: createWrapper()
      });

      await expect(
        result.current.mutateAsync({
          orderId: 'test-order-id',
          status: 'preparing' as OrderStatus,
          deliveryType: 'delivery'
        })
      ).rejects.toThrow('Invalid status transition');
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() => ({
        data: null,
        error: new Error('Database error')
      }));

      const { result } = renderHook(() => useUpdateOrderStatus(), {
        wrapper: createWrapper()
      });

      await expect(
        result.current.mutateAsync({
          orderId: 'test-order-id',
          status: 'confirmed' as OrderStatus,
          deliveryType: 'delivery'
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('useOrders', () => {
    it('should fetch orders with correct filters', async () => {
      const { result } = renderHook(
        () => useOrders({
          status: 'pending' as OrderStatus,
          deliveryType: 'delivery'
        }),
        { wrapper: createWrapper() }
      );

      await result.current.refetch();

      expect(supabase.from).toHaveBeenCalledWith('orders');
      const mockSelect = vi.mocked(supabase.from)().select;
      expect(mockSelect).toHaveBeenCalled();
    });

    it('should handle search filters', async () => {
      const { result } = renderHook(
        () => useOrders({
          search: 'test',
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }),
        { wrapper: createWrapper() }
      );

      await result.current.refetch();

      const mockSelect = vi.mocked(supabase.from)().select;
      expect(mockSelect).toHaveBeenCalled();
    });
  });
}); 