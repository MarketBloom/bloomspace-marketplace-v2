import { useEffect, useState } from 'react';
import { getClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/format';
import { OrderStatus } from '@/types/order';
import { DashboardLayout } from '@/components/florist-dashboard/DashboardLayout';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  preparingOrders: number;
  deliveringOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export default function FloristDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    deliveringOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const supabase = getClient();
      
      // Get current florist
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: florist } = await supabase
        .from('florists')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      if (!florist) return;

      // Get orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('florist_id', florist.id);

      if (!orders) return;

      // Calculate stats
      const newStats: DashboardStats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: orders.filter(order => order.status === 'pending').length,
        preparingOrders: orders.filter(order => order.status === 'preparing').length,
        deliveringOrders: orders.filter(order => 
          order.status === 'out_for_delivery' || 
          order.status === 'ready_for_pickup'
        ).length,
        completedOrders: orders.filter(order => 
          order.status === 'delivered' || 
          order.status === 'picked_up'
        ).length,
        cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
      };

      setStats(newStats);
    }

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Welcome back to your flower shop</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Export Data</Button>
            <Button>View Orders</Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Total Orders', value: stats.totalOrders },
            { label: 'Pending', value: stats.pendingOrders },
            { label: 'Preparing', value: stats.preparingOrders },
            { label: 'Delivering', value: stats.deliveringOrders },
            { label: 'Completed', value: stats.completedOrders },
            { label: 'Cancelled', value: stats.cancelledOrders },
            { label: 'Total Revenue', value: formatPrice(stats.totalRevenue) },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Recent Orders */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          {/* TODO: Add RecentOrders component */}
        </Card>

        {/* Popular Products */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Popular Products</h2>
          {/* TODO: Add PopularProducts component */}
        </Card>

        {/* Revenue Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Overview</h2>
          {/* TODO: Add RevenueChart component */}
        </Card>
      </div>
    </DashboardLayout>
  );
} 