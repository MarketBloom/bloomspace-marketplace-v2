import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from './use-toast';
import { googleMapsService } from '../services/google-maps';
import type { AddressWithCoordinates } from '../types/address';

const AUSTRALIAN_BOUNDS = {
  north: -9.142176,
  south: -44.640507,
  east: 153.638669,
  west: 112.911309,
};

interface UseGooglePlacesProps {
  initialValue?: string;
  onAddressSelect?: (address: AddressWithCoordinates) => void;
  onCoordsChange?: (coords: [number, number]) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  onError?: (error: Error) => void;
  mode?: 'address' | 'business';
}

const convertGoogleCoordsToInternal = (location: google.maps.LatLng) => ({
  lat: location.lat(),
  lng: location.lng()
});

export function useGooglePlaces({
  initialValue = '',
  onAddressSelect,
  onCoordsChange,
  onPlaceSelect,
  onError,
  mode = 'address'
}: UseGooglePlacesProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isSelectingRef = useRef(false);

  const showError = useCallback((message: string) => {
    const error = new Error(message);
    setError(error);
    if (onError) {
      onError(error);
    }
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  }, [toast, onError]);

  const handlePlaceSelect = useCallback(() => {
    if (!autocompleteRef.current) return;

    isSelectingRef.current = true;
    const place = autocompleteRef.current.getPlace();
    
    if (!place.geometry || !place.address_components) {
      showError('No details available for this place');
      isSelectingRef.current = false;
      return;
    }

    const coordinates = convertGoogleCoordsToInternal(place.geometry.location);
    
    const address: AddressWithCoordinates = {
      placeId: place.place_id || '',
      description: mode === 'business' ? place.name || '' : place.formatted_address || '',
      formattedAddress: place.formatted_address || '',
      coordinates,
      addressComponents: {
        streetNumber: place.address_components.find(c => c.types.includes('street_number'))?.long_name,
        route: place.address_components.find(c => c.types.includes('route'))?.long_name,
        locality: place.address_components.find(c => c.types.includes('locality'))?.long_name,
        area: place.address_components.find(c => c.types.includes('sublocality'))?.long_name,
        state: place.address_components.find(c => c.types.includes('administrative_area_level_1'))?.short_name,
        country: 'Australia',
        postalCode: place.address_components.find(c => c.types.includes('postal_code'))?.long_name
      },
      businessDetails: mode === 'business' && place.name ? {
        name: place.name,
        website: place.website || '',
        phone: place.formatted_phone_number || '',
        openingHours: place.opening_hours?.weekday_text || [],
        photos: place.photos?.map(photo => ({
          url: photo.getUrl(),
          height: photo.height,
          width: photo.width
        })) || []
      } : undefined
    };

    if (onAddressSelect) {
      onAddressSelect(address);
    }

    if (onCoordsChange) {
      onCoordsChange([coordinates.lat, coordinates.lng]);
    }

    if (onPlaceSelect) {
      onPlaceSelect(place);
    }

    // Update input value with formatted address
    const formattedAddress = place.formatted_address || '';
    setInputValue(formattedAddress);
    
    // Ensure the input value is updated
    if (inputRef.current) {
      inputRef.current.value = formattedAddress;
    }

    // Reset selecting state after a short delay to allow React state to update
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 100);
  }, [mode, onAddressSelect, onCoordsChange, onPlaceSelect, showError]);

  const initAutocomplete = useCallback(async (input: HTMLInputElement) => {
    try {
      if (!input) return;
      
      inputRef.current = input;
      
      // If we already have an autocomplete instance for this input, don't create another one
      if (autocompleteRef.current) {
        return;
      }
      
      setIsLoading(true);
      setError(null);

      // Ensure Google Maps is initialized
      await googleMapsService.ensureInitialized();
      
      const bounds = new google.maps.LatLngBounds(
        { lat: AUSTRALIAN_BOUNDS.south, lng: AUSTRALIAN_BOUNDS.west },
        { lat: AUSTRALIAN_BOUNDS.north, lng: AUSTRALIAN_BOUNDS.east }
      );
      
      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: mode === 'business' ? ['establishment'] : ['geocode'],
        componentRestrictions: { country: 'au' },
        bounds,
        fields: [
          'address_components',
          'formatted_address',
          'geometry',
          'place_id',
          'name'
        ]
      });

      // Add place_changed event listener
      autocomplete.addListener('place_changed', handlePlaceSelect);

      autocompleteRef.current = autocomplete;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize address search';
      console.error('Error initializing Google Places:', error);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [mode, handlePlaceSelect, showError]);

  const clearAutocomplete = useCallback(() => {
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }
    inputRef.current = null;
  }, []);

  // Handle manual input changes
  const handleInputChange = useCallback((value: string) => {
    if (!isSelectingRef.current) {
      setInputValue(value);
      if (inputRef.current) {
        inputRef.current.value = value;
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutocomplete();
    };
  }, [clearAutocomplete]);

  return {
    inputValue,
    setInputValue: handleInputChange,
    isLoading,
    error,
    initAutocomplete,
    clearAutocomplete
  };
} 