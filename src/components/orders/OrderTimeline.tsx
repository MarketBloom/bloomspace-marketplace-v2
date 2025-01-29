import { getOrderStatusConfig } from '@/config/orderStatus';
import { OrderStatus } from '@/types/order';
import { cn } from '@/lib/utils';

interface StatusHistoryItem {
  status: OrderStatus;
  notes?: string;
  created_at: string;
  created_by: string;
}

interface OrderTimelineProps {
  statusHistory: StatusHistoryItem[];
  className?: string;
}

export function OrderTimeline({ statusHistory, className }: OrderTimelineProps) {
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className={cn('space-y-6', className)}>
      {sortedHistory.map((status, index) => {
        const config = getOrderStatusConfig(status.status);
        const isLast = index === sortedHistory.length - 1;

        return (
          <div key={index} className="relative pl-8 pb-6 last:pb-0">
            {!isLast && (
              <div 
                className={cn(
                  'absolute left-[15px] top-6 bottom-0 w-0.5',
                  {
                    'bg-green-200': config.color === 'green',
                    'bg-blue-200': config.color === 'blue',
                    'bg-yellow-200': config.color === 'yellow',
                    'bg-purple-200': config.color === 'purple',
                    'bg-red-200': config.color === 'red',
                    'bg-gray-200': config.color === 'gray',
                  }
                )}
              />
            )}
            <div className="relative">
              <div 
                className={cn(
                  'absolute left-[-15px] w-4 h-4 rounded-full',
                  {
                    'bg-green-500': config.color === 'green',
                    'bg-blue-500': config.color === 'blue',
                    'bg-yellow-500': config.color === 'yellow',
                    'bg-purple-500': config.color === 'purple',
                    'bg-red-500': config.color === 'red',
                    'bg-gray-500': config.color === 'gray',
                  }
                )}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{config.label}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(status.created_at).toLocaleString()}
                  </span>
                </div>
                {status.notes && (
                  <p className="text-gray-600 mt-1">{status.notes}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 