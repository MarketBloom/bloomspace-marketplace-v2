import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { OrderStatus } from "@/types/order";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  Package, 
  XCircle,
  AlertTriangle
} from "lucide-react";
import { getAvailableStatuses } from "@/utils/orderValidation";

interface OrderStatusActionsProps {
  status: OrderStatus;
  deliveryType: 'delivery' | 'pickup';
  onStatusChange: (newStatus: OrderStatus, notes?: string) => void;
  isLoading?: boolean;
}

interface StatusAction {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export const OrderStatusActions = ({ 
  status, 
  deliveryType,
  onStatusChange,
  isLoading 
}: OrderStatusActionsProps) => {
  const [statusToConfirm, setStatusToConfirm] = useState<OrderStatus | null>(null);
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get available status actions based on current status and delivery type
  const getStatusActions = (currentStatus: OrderStatus): StatusAction[] => {
    const availableStatuses = getAvailableStatuses(currentStatus, deliveryType);

    return availableStatuses.map(status => {
      const baseAction = {
        status,
        requiresConfirmation: status === 'cancelled',
        confirmationMessage: status === 'cancelled' 
          ? "Are you sure you want to cancel this order? This action cannot be undone."
          : undefined
      };

      switch (status) {
        case 'confirmed':
          return {
            ...baseAction,
            label: "Confirm Order",
            icon: <CheckCircle className="h-4 w-4" />,
            variant: "default"
          };
        case 'preparing':
          return {
            ...baseAction,
            label: "Start Preparing",
            icon: <Package className="h-4 w-4" />,
            variant: "default"
          };
        case 'ready_for_delivery':
          return {
            ...baseAction,
            label: "Ready for Delivery",
            icon: <Package className="h-4 w-4" />,
            variant: "default"
          };
        case 'ready_for_pickup':
          return {
            ...baseAction,
            label: "Ready for Pickup",
            icon: <Package className="h-4 w-4" />,
            variant: "default"
          };
        case 'out_for_delivery':
          return {
            ...baseAction,
            label: "Out for Delivery",
            icon: <Truck className="h-4 w-4" />,
            variant: "default"
          };
        case 'delivered':
          return {
            ...baseAction,
            label: "Mark as Delivered",
            icon: <CheckCircle className="h-4 w-4" />,
            variant: "default"
          };
        case 'picked_up':
          return {
            ...baseAction,
            label: "Mark as Picked Up",
            icon: <CheckCircle className="h-4 w-4" />,
            variant: "default"
          };
        case 'cancelled':
          return {
            ...baseAction,
            label: "Cancel Order",
            icon: <XCircle className="h-4 w-4" />,
            variant: "destructive"
          };
        default:
          return {
            ...baseAction,
            label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            icon: <Clock className="h-4 w-4" />,
            variant: "default"
          };
      }
    });
  };

  const handleStatusChange = (action: StatusAction) => {
    if (action.requiresConfirmation) {
      setStatusToConfirm(action.status);
    } else {
      setIsDialogOpen(true);
      setStatusToConfirm(action.status);
    }
  };

  const confirmStatusChange = () => {
    if (statusToConfirm) {
      onStatusChange(statusToConfirm, notes);
      setStatusToConfirm(null);
      setNotes("");
      setIsDialogOpen(false);
    }
  };

  const actions = getStatusActions(status);

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-6 flex justify-end gap-2">
        {actions.map((action) => (
          <Button
            key={action.status}
            variant={action.variant}
            onClick={() => handleStatusChange(action)}
            disabled={isLoading}
            className="gap-2"
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>

      {/* Confirmation Dialog for potentially destructive actions */}
      <AlertDialog 
        open={!!statusToConfirm && actions.find(a => a.status === statusToConfirm)?.requiresConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {actions.find(a => a.status === statusToConfirm)?.confirmationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStatusToConfirm(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notes Dialog for status changes */}
      <Dialog 
        open={isDialogOpen && !actions.find(a => a.status === statusToConfirm)?.requiresConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notes (Optional)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Add any notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setStatusToConfirm(null);
                setNotes("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmStatusChange}>
              Update Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};