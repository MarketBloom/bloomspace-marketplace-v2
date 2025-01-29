import { useState } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types/order';
import { getNextOrderStatuses } from '@/config/orderStatus';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { getClient } from '@/lib/supabase/client';

interface OrderActionsProps {
  order: Order;
}

export function OrderActions({ order }: OrderActionsProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const nextStatuses = getNextOrderStatuses(order.status);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    setIsLoading(true);
    const supabase = getClient();

    try {
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: selectedStatus })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Add status history entry
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: order.id,
          status: selectedStatus,
          notes: notes.trim() || null,
        });

      if (historyError) throw historyError;

      setIsUpdateOpen(false);
      setSelectedStatus(null);
      setNotes('');
    } catch (error) {
      console.error('Error updating order status:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/florist/dashboard/orders/${order.id}`}>
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/florist/dashboard/orders/${order.id}/print`}>
              Print Order
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {nextStatuses.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setIsUpdateOpen(true);
              }}
            >
              Mark as {status.replace(/_/g, ' ')}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this order as{' '}
              {selectedStatus?.replace(/_/g, ' ')}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="text-sm font-medium text-gray-700"
              >
                Add Notes (Optional)
              </label>
              <Textarea
                id="notes"
                placeholder="Enter any notes about this status change..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 