import { cn } from '@/lib/utils';
import { Order } from '@/types/schema';
import { CheckCircle2, Clock, Package, Send, Truck, XCircle } from 'lucide-react';

interface OrderStatusProps {
  status: Order['status'];
  className?: string;
}

export function OrderStatus({ status, className }: OrderStatusProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    confirmed: {
      icon: CheckCircle2,
      label: 'Confirmed',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    preparing: {
      icon: Package,
      label: 'Preparing',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    out_for_delivery: {
      icon: Truck,
      label: 'Out for Delivery',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
    delivered: {
      icon: Send,
      label: 'Delivered',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    cancelled: {
      icon: XCircle,
      label: 'Cancelled',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
}
