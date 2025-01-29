import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { useOrders, useUpdateOrderStatus } from '@/hooks/api/useOrders';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostgrestFilterBuilder, PostgrestResponse } from '@supabase/postgrest-js';
import { OrderStatus } from '@/types/order';
import React from 'react';

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
        or: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [],
                error: null
              }))
            }))
          }))
        })),
        order: vi.fn(() => ({
          data: [],
          error: null
        }))
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
    })) as unknown as Promise<PostgrestResponse<any>>
  }
}));

describe('Order Management Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });
    vi.clearAllMocks();
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('useUpdateOrderStatus', () => {
    it('should successfully update order status', async () => {
      const { result } = renderHook(() => useUpdateOrderStatus(), {
        wrapper: Wrapper
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
        wrapper: Wrapper
      });

      await expect(
        result.current.mutateAsync({
          orderId: 'test-order-id',
          status: 'preparing' as OrderStatus,
          deliveryType: 'delivery'
        })
      ).rejects.toThrow('Cannot transition from delivered to preparing');
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() => 
        Promise.resolve({
          data: null,
          error: new Error('Database error'),
          count: null,
          status: 500,
          statusText: 'Internal Server Error'
        })
      );

      const { result } = renderHook(() => useUpdateOrderStatus(), {
        wrapper: Wrapper
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
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }));

      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: mockSelect
      }));

      const { result } = renderHook(
        () => useOrders({
          status: 'pending' as OrderStatus,
          deliveryType: 'delivery'
        }),
        { wrapper: Wrapper }
      );

      await result.current.refetch();

      expect(supabase.from).toHaveBeenCalledWith('orders');
      expect(mockSelect).toHaveBeenCalled();
    });

    it('should handle search filters', async () => {
      const mockSelect = vi.fn(() => ({
        or: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      }));

      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: mockSelect
      }));

      const { result } = renderHook(
        () => useOrders({
          search: 'test',
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }),
        { wrapper: Wrapper }
      );

      await result.current.refetch();

      expect(mockSelect).toHaveBeenCalled();
    });
  });
}); 