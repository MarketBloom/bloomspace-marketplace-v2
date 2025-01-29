import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Clock } from "lucide-react";

interface RecentOrdersProps {
  floristId: string;
}

export const RecentOrders = ({ floristId }: RecentOrdersProps) => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['florist-orders', floristId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:customer_id (full_name),
          order_items (
            *,
            products (title)
          )
        `)
        .eq('florist_id', floristId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!floristId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Orders</h2>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Recent Orders</h2>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      {orders?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-lg font-medium">No orders yet</p>
            <p className="text-sm text-muted-foreground">
              Orders will appear here once customers start placing them
            </p>
          </CardContent>
        </Card>
      ) : (
        orders?.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                  <p className="text-sm text-muted-foreground">
                    From: {order.profiles?.full_name || 'Anonymous'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.total_amount}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.products?.title} × {item.quantity}</span>
                    <span>${item.price_at_time}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`${
                    order.status === 'completed' ? 'bg-green-50' : 
                    order.status === 'processing' ? 'bg-blue-50' : ''
                  }`}
                >
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </Button>
                <Button size="sm">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};