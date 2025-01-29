import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { calculateDistance } from '@/utils/geo';
import type { AddressWithCoordinates } from '@/types/address';

export interface DeliveryZoneProps {
  floristAddress: AddressWithCoordinates;
  customerAddress: AddressWithCoordinates;
  radiusKm: number;
  onResult?: (isInZone: boolean, distance: number) => void;
}

export function useDeliveryZone() {
  const { toast } = useToast();

  const checkDeliveryZone = useCallback(
    async ({ floristAddress, customerAddress, radiusKm, onResult }: DeliveryZoneProps) => {
      try {
        const result = await calculateDistance(floristAddress, customerAddress);
        const distanceKm = result.distance / 1000;
        const isInZone = distanceKm <= radiusKm;

        if (onResult) {
          onResult(isInZone, distanceKm);
        }

        return {
          isInZone,
          distance: distanceKm,
          duration: result.duration,
        };
      } catch (error) {
        console.error('Error checking delivery zone:', error);
        toast({
          title: 'Error',
          description: 'Could not calculate delivery distance. Please try again.',
          variant: 'destructive',
        });
        return {
          isInZone: false,
          distance: 0,
          duration: 0,
        };
      }
    },
    [toast]
  );

  return {
    checkDeliveryZone,
  };
}

export default useDeliveryZone; 