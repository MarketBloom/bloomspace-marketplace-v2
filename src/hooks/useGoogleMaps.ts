import { useState, useEffect } from 'react';
import { googleMapsService } from '../services/google-maps';
import { useToast } from './use-toast';
import type { AddressWithCoordinates } from '../types/address';

interface UseGoogleMapsProps {
  searchParams: {
    query?: string;
    lat?: number;
    lng?: number;
  };
  onCoordsChange: (coords: { lat: number; lng: number } | null) => void;
}

export const useGoogleMaps = ({ searchParams, onCoordsChange }: UseGoogleMapsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const searchLocation = async () => {
      if (!searchParams.query) {
        onCoordsChange(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Search for the address using Places Autocomplete
        const predictions = await googleMapsService.searchAddress(searchParams.query);
        
        if (predictions.length > 0) {
          // Get details for the first prediction
          const details = await googleMapsService.getPlaceDetails(predictions[0].place_id);
          
          if (details.coordinates) {
            onCoordsChange({
              lat: details.coordinates.latitude,
              lng: details.coordinates.longitude
            });
          } else {
            onCoordsChange(null);
            setError('No coordinates found for this location');
          }
        } else {
          onCoordsChange(null);
          setError('No results found');
        }
      } catch (err) {
        console.error('Error searching location:', err);
        setError('Error searching location');
        onCoordsChange(null);
        
        toast({
          title: "Error",
          description: "Failed to search location. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    searchLocation();
  }, [searchParams.query, onCoordsChange, toast]);

  return {
    isLoading,
    error
  };
};