import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusTracker } from "@/components/order/OrderStatusTracker";
import { OrderStatus } from "@/types/order";

interface RecentOrdersProps {
  orders: any[];
  isLoading: boolean;
}

export const RecentOrders = ({ orders, isLoading }: RecentOrdersProps) => {
  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  if (orders?.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>You haven't placed any orders yet.</p>
          <Button className="mt-4" onClick={() => window.location.href = "/search"}>
            Browse Flowers
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders?.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                <p className="text-sm text-muted-foreground">
                  From: {order.florist_profiles?.store_name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${order.total_amount}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <OrderStatusTracker
              orderId={order.id}
              currentStatus={order.status as OrderStatus}
              className="mb-6"
            />

            <div className="space-y-2">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.products?.title} × {item.quantity}</span>
                  <span>${item.price_at_time}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              {order.status === "delivered" && (
                <Button variant="outline">Leave Review</Button>
              )}
              <Button variant="outline">View Details</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};