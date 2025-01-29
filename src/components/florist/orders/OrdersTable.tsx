import { useState } from 'react';
import Link from 'next/link';
import { Order } from '@/types/order';
import { getOrderStatusConfig } from '@/config/orderStatus';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OrderActions } from './OrderActions';

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const toggleOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleAll = () => {
    setSelectedOrders(prev =>
      prev.length === orders.length
        ? []
        : orders.map(order => order.id)
    );
  };

  return (
    <div>
      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-primary/5 p-4 flex items-center justify-between">
          <p className="text-sm">
            {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Print Selected
            </Button>
            <Button variant="outline" size="sm">
              Export Selected
            </Button>
            <Button variant="destructive" size="sm">
              Cancel Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedOrders.length === orders.length}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusConfig = getOrderStatusConfig(order.status);
            return (
              <TableRow key={order.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={() => toggleOrder(order.id)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <Link
                      href={`/florist/dashboard/orders/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      #{order.id}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.recipient_name}</p>
                    <p className="text-sm text-gray-500">{order.recipient_phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`bg-${statusConfig.color}-50 text-${statusConfig.color}-700 border-${statusConfig.color}-200`}
                  >
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.items.length} items</p>
                    <p className="text-sm text-gray-500">
                      {order.items.map(item => item.product.name).join(', ')}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(order.subtotal)} + {formatPrice(order.delivery_fee)} delivery
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{formatDate(order.created_at)}</p>
                    {order.delivery_date && (
                      <p className="text-sm text-gray-500">
                        Delivery: {formatDate(order.delivery_date)}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <OrderActions order={order} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 