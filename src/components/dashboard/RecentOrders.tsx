import { formatPrice, formatDate } from "@/utils/format";
import { Package, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  date: string;
  status: "processing" | "shipped" | "delivered";
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

interface RecentOrdersProps {
  orders: Order[];
  isLoading?: boolean;
}

const getStatusIcon = (status: Order["status"]) => {
  switch (status) {
    case "processing":
      return <Package className="h-5 w-5 text-blue-500" />;
    case "shipped":
      return <Truck className="h-5 w-5 text-orange-500" />;
    case "delivered":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
  }
};

const getStatusText = (status: Order["status"]) => {
  switch (status) {
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
  }
};

export function RecentOrders({ orders, isLoading }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-4 shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Orders</h2>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/orders"}>
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-500">Order #{order.id}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(new Date(order.date))}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span
                  className={`text-sm font-medium ${
                    order.status === "delivered"
                      ? "text-green-600"
                      : order.status === "shipped"
                      ? "text-orange-600"
                      : "text-blue-600"
                  }`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
              <p className="font-medium">{formatPrice(order.total)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={() => window.location.href = `/order/${order.id}`}
            >
              View Details
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 