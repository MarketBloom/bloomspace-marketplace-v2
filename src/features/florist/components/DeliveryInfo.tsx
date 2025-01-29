import React from 'react';
import { Truck } from 'lucide-react';

interface DeliveryInfoProps {
  deliveryFee?: number;
  deliveryRadius?: number;
  minimumOrderAmount?: number;
}

export const DeliveryInfo = ({ deliveryFee, deliveryRadius, minimumOrderAmount }: DeliveryInfoProps) => {
  return (
    <div className="space-y-2 border-t border-b py-3">
      {deliveryFee !== undefined && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <Truck className="h-4 w-4 mr-1" />
            <span>Delivery Fee:</span>
          </div>
          <span className="font-medium">
            {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
          </span>
        </div>
      )}
      
      {deliveryRadius && deliveryRadius > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Delivery Area:</span>
          <span className="font-medium">{deliveryRadius}km radius</span>
        </div>
      )}

      {minimumOrderAmount && minimumOrderAmount > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Minimum Order:</span>
          <span className="font-medium">${minimumOrderAmount.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};