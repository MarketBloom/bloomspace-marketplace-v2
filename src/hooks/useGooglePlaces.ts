import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { useToast } from '../components/ui/use-toast';
import { googleMapsService } from '../services/google-maps';
import type { AddressWithCoordinates } from '../types/address';

interface UseGooglePlacesProps {
  initialValue?: string;
  onAddressSelect?: (address: AddressWithCoordinates) => void;
  onCoordsChange?: (coords: [number, number]) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
}

export function useGooglePlaces({
  initialValue = '',
  onAddressSelect,
  onCoordsChange,
  onPlaceSelect
}: UseGooglePlacesProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const debouncedValue = useDebounce(inputValue, 300);
  const { toast } = useToast();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const apiLoadedRef = useRef(false);

  // Memoize the showError function
  const showError = useCallback((message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  }, [toast]);

  const waitForGoogleMapsApi = useCallback(async (): Promise<boolean> => {
    if (window.google?.maps?.places) {
      return true;
    }

    // Wait for up to 5 seconds for the API to load
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (window.google?.maps?.places) {
        return true;
      }
    }
    return false;
  }, []);

  const initAutocomplete = useCallback(async (input: HTMLInputElement) => {
    try {
      setIsLoading(true);
      
      // Wait for Google Maps API to load
      const apiLoaded = await waitForGoogleMapsApi();
      if (!apiLoaded) {
        console.warn('Google Maps Places API failed to load after timeout');
        return;
      }
      
      apiLoadedRef.current = true;
      
      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['geocode'],
        componentRestrictions: { country: 'au' },
        fields: ['address_components', 'formatted_address', 'geometry']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry || !place.address_components) {
          showError('No details available for this place');
          return;
        }

        const addressComponents = place.address_components;
        const address: AddressWithCoordinates = {
          street_number: addressComponents.find(c => c.types.includes('street_number'))?.long_name || '',
          street_name: addressComponents.find(c => c.types.includes('route'))?.long_name || '',
          suburb: addressComponents.find(c => c.types.includes('locality'))?.long_name || '',
          state: addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.short_name || '',
          postcode: addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '',
          country: 'Australia',
          coordinates: {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          },
          formatted_address: place.formatted_address || ''
        };

        if (onAddressSelect) {
          onAddressSelect(address);
        }
      });

      autocompleteRef.current = autocomplete;
    } catch (error) {
      console.error('Error initializing Google Places:', error);
      showError('Failed to initialize address search');
    } finally {
      setIsLoading(false);
    }
  }, [onAddressSelect, showError, waitForGoogleMapsApi]);

  const clearAutocomplete = useCallback(() => {
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedValue || debouncedValue.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const predictions = await googleMapsService.searchAddress(debouncedValue);
        setSuggestions(predictions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        // Only show error toast for actual errors, not for initialization
        if (error.message !== 'Google Places service not initialized') {
          showError("Failed to fetch location suggestions. Please try again.");
        }
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API calls
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [debouncedValue, showError]);

  const handleSuggestionSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    try {
      const address = await googleMapsService.getPlaceDetails(suggestion.place_id);
      setInputValue(suggestion.description);
      
      if (onAddressSelect) {
        onAddressSelect(address);
      }

      if (onCoordsChange && address.coordinates) {
        onCoordsChange([address.coordinates.latitude, address.coordinates.longitude]);
      }

      setSuggestions([]);
    } catch (error) {
      console.error('Error getting place details:', error);
      showError("Failed to get location details. Please try again.");
    }
  };

  return {
    inputValue,
    setInputValue,
    isLoading,
    suggestions,
    handleSuggestionSelect,
    initAutocomplete,
    clearAutocomplete
  };
} 