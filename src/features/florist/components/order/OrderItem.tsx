import { OrderStatus } from "@/types/order";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusTracker } from "@/features/orders/components/OrderStatusTracker";
import { OrderHeader } from "./OrderHeader";
import { OrderItemsList } from "./OrderItemsList";
import { OrderStatusActions } from "./OrderStatusActions";

interface OrderItemProps {
  order: {
    id: string;
    status: OrderStatus;
    delivery_type: 'delivery' | 'pickup';
    total_amount: number;
    created_at: string;
    profiles?: { full_name: string | null };
    order_items?: Array<{
      id: string;
      products?: {
        id: string;
        title: string;
        images?: string[];
      };
      product_size?: {
        id: string;
        name: string;
      };
      quantity: number;
      price_at_time: number;
      notes?: string;
    }>;
  };
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrderItem = ({ order, onStatusChange }: OrderItemProps) => {
  return (
    <Card key={order.id}>
      <CardContent className="p-6">
        <OrderHeader 
          orderId={order.id}
          customerName={order.profiles?.full_name}
          totalAmount={order.total_amount}
          createdAt={order.created_at}
        />

        <OrderStatusTracker
          orderId={order.id}
          currentStatus={order.status}
          onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
          className="mb-6"
        />

        <OrderItemsList items={order.order_items || []} />

        <OrderStatusActions 
          status={order.status}
          deliveryType={order.delivery_type}
          onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
        />
      </CardContent>
    </Card>
  );
};