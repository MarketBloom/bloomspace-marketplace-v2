import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OrderStatus, ORDER_STATUSES } from "@/types/order";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface OrderStatusTrackerProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange?: (newStatus: OrderStatus) => void;
  className?: string;
}

export const OrderStatusTracker = ({
  orderId,
  currentStatus,
  onStatusChange,
  className
}: OrderStatusTrackerProps) => {
  useEffect(() => {
    // Subscribe to real-time updates for this specific order
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          const newStatus = payload.new.status as OrderStatus;
          if (newStatus !== currentStatus) {
            onStatusChange?.(newStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, currentStatus, onStatusChange]);

  const getStatusIcon = (status: OrderStatus) => {
    if (status === "cancelled") return <XCircle className="h-6 w-6" />;
    if (status === "delivered") return <CheckCircle2 className="h-6 w-6" />;
    return <Clock className="h-6 w-6" />;
  };

  const orderStatuses = Object.values(ORDER_STATUSES);
  const currentStatusIndex = orderStatuses.findIndex(s => s.status === currentStatus);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        {orderStatuses.map((status, index) => {
          const isActive = index <= currentStatusIndex && currentStatus !== "cancelled";
          const isCurrent = status.status === currentStatus;

          return (
            <div
              key={status.status}
              className={cn(
                "flex flex-col items-center space-y-2",
                index < orderStatuses.length - 1 && "flex-1"
              )}
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center",
                    isActive ? status.color : "bg-gray-200",
                    isCurrent && "ring-4 ring-offset-2 ring-gray-100"
                  )}
                >
                  {getStatusIcon(status.status)}
                </div>
                {index < orderStatuses.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-[100%] h-1 w-full -translate-y-1/2",
                      isActive ? status.color : "bg-gray-200"
                    )}
                  />
                )}
              </div>
              <span className="text-sm font-medium">{status.label}</span>
              <span className="text-xs text-gray-500 text-center">
                {status.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};