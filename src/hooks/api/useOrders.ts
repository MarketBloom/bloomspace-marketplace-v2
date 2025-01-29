import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrdersTable, OrderStatus, OrderStatusHistoryTable } from '@/types/order';
import { toast } from '@/components/ui/use-toast';
import { isValidStatusTransition } from '@/utils/orderValidation';

interface OrderFilters {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  deliveryType?: 'delivery' | 'pickup';
}

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              images
            ),
            product_size:product_sizes (
              id,
              name
            )
          ),
          order_status_history (
            *
          )
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.deliveryType) {
        query = query.eq('delivery_type', filters.deliveryType);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters?.search) {
        query = query.or(`id.ilike.%${filters.search}%,customer_notes.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    }
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              images
            ),
            product_size:product_sizes (
              id,
              name
            )
          ),
          order_status_history (
            *
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return data;
    },
    enabled: !!orderId
  });
}

interface UpdateOrderStatusData {
  orderId: string;
  status: OrderStatus;
  notes?: string;
  deliveryType: 'delivery' | 'pickup';
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, notes, deliveryType }: UpdateOrderStatusData) => {
      // Get current order status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Validate status transition
      const validation = isValidStatusTransition(order.status, status, deliveryType);
      if (!validation.valid) {
        throw new Error(validation.reason || 'Invalid status transition');
      }

      // Start a transaction
      const { data, error: updateError } = await supabase.rpc('update_order_status', {
        p_order_id: orderId,
        p_status: status,
        p_notes: notes || null
      });

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });

      // Show success message
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    }
  });
}

interface UpdateOrderData extends Partial<Omit<OrdersTable['Update'], 'id' | 'created_at' | 'updated_at'>> {
  id: string;
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOrderData) => {
      const { error } = await supabase
        .from('orders')
        .update({
          delivery_instructions: data.delivery_instructions,
          delivery_date: data.delivery_date,
          delivery_time_slot: data.delivery_time_slot,
          internal_notes: data.internal_notes,
          metadata: data.metadata
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      toast({
        title: 'Success',
        description: 'Order updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order. Please try again.',
        variant: 'destructive',
      });
    }
  });
}

export function useOrderAnalytics(floristId: string, period: 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: ['orderAnalytics', floristId, period],
    queryFn: async () => {
      let timeFilter: string;
      switch (period) {
        case 'week':
          timeFilter = 'now() - interval \'7 days\'';
          break;
        case 'month':
          timeFilter = 'now() - interval \'30 days\'';
          break;
        default:
          timeFilter = 'now() - interval \'24 hours\'';
      }

      const { data, error } = await supabase
        .rpc('get_order_analytics', {
          p_florist_id: floristId,
          p_start_time: timeFilter
        });

      if (error) throw error;

      return data;
    },
    enabled: !!floristId
  });
}
