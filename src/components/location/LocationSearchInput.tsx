import React from 'react';
import { Input } from '../ui/input';
import { useGooglePlaces } from '../../hooks/useGooglePlaces';
import { Loader2 } from 'lucide-react';
import type { AddressWithCoordinates } from '../../types/address';

interface LocationSearchInputProps {
  onPlaceSelected: (address: AddressWithCoordinates) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  onPlaceSelected,
  placeholder = 'Enter a location',
  defaultValue = '',
  className = '',
}) => {
  const {
    inputValue,
    setInputValue,
    isLoading,
    suggestions,
    handleSuggestionSelect
  } = useGooglePlaces({
    initialValue: defaultValue,
    onAddressSelect: onPlaceSelected
  });

  return (
    <div className="relative">
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}
      
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};