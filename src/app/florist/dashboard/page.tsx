import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/utils/format';
import { OrderStatus } from '@/types/order';

export const metadata: Metadata = {
  title: 'Dashboard Overview | Bloomspace',
  description: 'Overview of your flower shop performance',
};

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  preparingOrders: number;
  deliveryOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

async function getDashboardStats(floristId: string): Promise<DashboardStats> {
  const supabase = createClient();
  const today = new Date();
  const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

  // Get all orders in the last 30 days
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('florist_id', floristId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (!orders) return {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    deliveryOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  };

  return {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    preparingOrders: orders.filter(order => order.status === 'preparing').length,
    deliveryOrders: orders.filter(order => 
      order.status === 'out_for_delivery' || 
      order.status === 'ready_for_pickup'
    ).length,
    completedOrders: orders.filter(order => 
      order.status === 'delivered' || 
      order.status === 'picked_up'
    ).length,
    cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
  };
}

export default async function DashboardPage() {
  const supabase = createClient();
  
  // Get current florist
  const { data: { session } } = await supabase.auth.getSession();
  const { data: florist } = await supabase
    .from('florists')
    .select('*')
    .eq('user_id', session!.user.id)
    .single();

  const stats = await getDashboardStats(florist!.id);

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:products (
          name
        )
      )
    `)
    .eq('florist_id', florist!.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {florist!.name}!</h1>
        <p className="text-gray-500">Here's what's happening with your shop today.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Orders (30d)</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalOrders}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Revenue (30d)</h3>
          <p className="text-2xl font-bold mt-2">{formatPrice(stats.totalRevenue)}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
          <p className="text-2xl font-bold mt-2">{stats.pendingOrders}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Orders in Progress</h3>
          <p className="text-2xl font-bold mt-2">
            {stats.preparingOrders + stats.deliveryOrders}
          </p>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Order Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Pending</h4>
            <p className="text-xl font-semibold mt-1">{stats.pendingOrders}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Preparing</h4>
            <p className="text-xl font-semibold mt-1">{stats.preparingOrders}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Out for Delivery</h4>
            <p className="text-xl font-semibold mt-1">{stats.deliveryOrders}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Completed</h4>
            <p className="text-xl font-semibold mt-1">{stats.completedOrders}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Cancelled</h4>
            <p className="text-xl font-semibold mt-1">{stats.cancelledOrders}</p>
          </div>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-4">
          {recentOrders?.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-4 border-b last:border-0">
              <div>
                <p className="font-medium">Order #{order.id}</p>
                <p className="text-sm text-gray-500">
                  {order.items.map(item => item.product.name).join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(order.total)}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 