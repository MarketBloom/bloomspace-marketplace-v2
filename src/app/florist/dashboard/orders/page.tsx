import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { OrdersTable } from '@/components/florist/orders/OrdersTable';
import { OrderFilters } from '@/components/florist/orders/OrderFilters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getOrderStatusConfig } from '@/config/orderStatus';
import { OrderStatus } from '@/types/order';

export const metadata: Metadata = {
  title: 'Order Management | Bloomspace',
  description: 'Manage your flower shop orders',
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();

  // Get current florist
  const { data: { session } } = await supabase.auth.getSession();
  const { data: florist } = await supabase
    .from('florists')
    .select('*')
    .eq('user_id', session!.user.id)
    .single();

  // Build query
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:products (
          name,
          image
        )
      ),
      customer:profiles (
        full_name,
        email
      ),
      status_history:order_status_history (
        status,
        notes,
        created_at,
        created_by
      )
    `)
    .eq('florist_id', florist!.id)
    .order('created_at', { ascending: false });

  // Apply filters
  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  if (searchParams.delivery_type) {
    query = query.eq('delivery_type', searchParams.delivery_type);
  }

  if (searchParams.date_from) {
    query = query.gte('created_at', searchParams.date_from);
  }

  if (searchParams.date_to) {
    query = query.lte('created_at', searchParams.date_to);
  }

  if (searchParams.search) {
    query = query.or(`
      recipient_name.ilike.%${searchParams.search}%,
      recipient_phone.ilike.%${searchParams.search}%,
      id.ilike.%${searchParams.search}%
    `);
  }

  // Get orders
  const { data: orders } = await query;

  // Calculate stats
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(order => order.status === 'pending').length || 0,
    preparing: orders?.filter(order => order.status === 'preparing').length || 0,
    delivering: orders?.filter(order => 
      order.status === 'out_for_delivery' || 
      order.status === 'ready_for_pickup'
    ).length || 0,
    completed: orders?.filter(order => 
      order.status === 'delivered' || 
      order.status === 'picked_up'
    ).length || 0,
    cancelled: orders?.filter(order => order.status === 'cancelled').length || 0,
    revenue: orders?.reduce((sum, order) => sum + order.total, 0) || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-gray-500">Manage your orders and track deliveries</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export Orders</Button>
          <Button>Print Orders</Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Total Orders', value: stats.total },
          { label: 'Pending', value: stats.pending },
          { label: 'Preparing', value: stats.preparing },
          { label: 'Out for Delivery', value: stats.delivering },
          { label: 'Completed', value: stats.completed },
          { label: 'Cancelled', value: stats.cancelled },
          { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}` },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <OrderFilters />
      </Card>

      {/* Orders Table */}
      <Card>
        <OrdersTable orders={orders || []} />
      </Card>
    </div>
  );
} 