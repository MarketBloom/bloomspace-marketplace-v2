import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format";
import { User, Clock, MapPin } from "lucide-react";

interface OrderHeaderProps {
  orderId: string;
  customerName: string | null;
  totalAmount: number;
  createdAt: string;
  deliveryType?: 'delivery' | 'pickup';
  deliveryAddress?: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
  };
  deliveryDate?: string;
  deliveryTimeSlot?: string;
}

export const OrderHeader = ({
  orderId,
  customerName,
  totalAmount,
  createdAt,
  deliveryType,
  deliveryAddress,
  deliveryDate,
  deliveryTimeSlot
}: OrderHeaderProps) => {
  const formattedAddress = deliveryAddress
    ? [
        deliveryAddress.street,
        deliveryAddress.suburb,
        deliveryAddress.state,
        deliveryAddress.postcode
      ].filter(Boolean).join(', ')
    : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Order #{orderId.slice(0, 8)}</h3>
            {deliveryType && (
              <Badge variant={deliveryType === 'delivery' ? 'default' : 'secondary'}>
                {deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{customerName || 'Anonymous'}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg">{formatCurrency(totalAmount)}</p>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(createdAt), 'PPp')}</span>
          </div>
        </div>
      </div>

      {(deliveryDate || formattedAddress) && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          {deliveryDate && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                Scheduled for {format(new Date(deliveryDate), 'PP')}
                {deliveryTimeSlot && ` at ${deliveryTimeSlot}`}
              </span>
            </div>
          )}
          {formattedAddress && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{formattedAddress}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};