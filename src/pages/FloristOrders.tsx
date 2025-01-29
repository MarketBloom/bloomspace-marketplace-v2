import { Metadata } from 'next';
import { getClient } from '@/lib/supabase/client';
import { OrdersTable } from '@/components/florist/orders/OrdersTable';
import { OrderFilters } from '@/components/florist/orders/OrderFilters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getOrderStatusConfig } from '@/config/orderStatus';
import { OrderStatus } from '@/types/order';
import { DashboardLayout } from '@/components/florist-dashboard/DashboardLayout';

export default function FloristOrders() {
  return (
    <DashboardLayout>
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

        {/* Filters */}
        <Card className="p-4">
          <OrderFilters />
        </Card>

        {/* Orders Table */}
        <Card>
          <OrdersTable orders={[]} />
        </Card>
      </div>
    </DashboardLayout>
  );
}