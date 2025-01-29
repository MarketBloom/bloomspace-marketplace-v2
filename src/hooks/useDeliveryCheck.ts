import { useState, useCallback } from 'react';
import { Coordinates, DeliveryCheckResult } from '../types/google-maps';
import { isWithinDeliveryRadius, filterFloristsByDeliveryRadius } from '../services/delivery-radius';

interface UseDeliveryCheckProps {
  useRoadDistance?: boolean;
}

export function useDeliveryCheck({ useRoadDistance = true }: UseDeliveryCheckProps = {}) {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<DeliveryCheckResult | null>(null);

  const checkDelivery = useCallback(async (
    floristLocation: Coordinates,
    deliveryLocation: Coordinates,
    radiusKm: number
  ) => {
    setIsChecking(true);
    setError(null);
    
    try {
      const isWithinRange = await isWithinDeliveryRadius(
        floristLocation,
        deliveryLocation,
        radiusKm
      );
      
      const result: DeliveryCheckResult = {
        isWithinRange,
        distance: 0, // Will be calculated by the service
        estimatedDuration: 0 // Will be calculated by the service
      };
      
      setLastCheck(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check delivery radius';
      setError(errorMessage);
      throw err;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const filterFlorists = useCallback(async (
    customerLocation: Coordinates,
    florists: Array<{
      id: string;
      coordinates: Coordinates;
      delivery_radius: number;
    }>
  ) => {
    setIsChecking(true);
    setError(null);
    
    try {
      return await filterFloristsByDeliveryRadius(
        customerLocation,
        florists
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter florists';
      setError(errorMessage);
      throw err;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    checkDelivery,
    filterFlorists,
    isChecking,
    error,
    lastCheck
  };
} 