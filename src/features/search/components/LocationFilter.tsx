/** @jsxImportSource react */
import React from "react";
import { Input } from "../../../components/ui/input";
import { MapPin } from "lucide-react";
import { useGooglePlaces } from "../../../hooks/useGooglePlaces";

interface LocationFilterProps {
  location: string;
  setLocation: (location: string) => void;
  onCoordsChange?: (coords: [number, number]) => void;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  location,
  setLocation,
  onCoordsChange
}) => {
  const {
    inputValue,
    setInputValue,
    isLoading,
    suggestions,
    handleSuggestionSelect
  } = useGooglePlaces({
    initialValue: location,
    onAddressSelect: (address) => {
      setLocation(address.formatted_address);
    },
    onCoordsChange
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Enter suburb or postcode..."
          value={inputValue}
          onChange={handleInputChange}
          className={`w-full pl-8 h-[42px] bg-white/90 border border-black text-xs ${isLoading ? 'opacity-70' : ''}`}
        />
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
      </div>
      
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[300px] overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              {suggestion.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};