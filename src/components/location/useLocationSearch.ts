import { useCallback, useState } from 'react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import type { AddressWithCoordinates } from '@/types/address';

export interface UseLocationSearchProps {
  onPlaceSelected?: (place: AddressWithCoordinates) => void;
}

export function useLocationSearch({ onPlaceSelected }: UseLocationSearchProps = {}) {
  const [inputValue, setInputValue] = useState('');
  const {
    suggestions,
    isLoading,
    handleInputChange,
    handleSuggestionSelected,
  } = useGooglePlaces({
    onPlaceSelected: (place) => {
      if (onPlaceSelected) {
        onPlaceSelected(place);
      }
    },
  });

  const handleChange = useCallback(
    (value: string) => {
      setInputValue(value);
      handleInputChange(value);
    },
    [handleInputChange]
  );

  return {
    inputValue,
    setInputValue: handleChange,
    suggestions,
    isLoading,
    handleSuggestionSelected,
  };
}

export default useLocationSearch;