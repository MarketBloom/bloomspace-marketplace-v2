import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Loader2 } from 'lucide-react';
import type { AddressWithCoordinates } from '@/types/address';

interface LocationSuggestionsProps {
  isOpen: boolean;
  suggestions: google.maps.places.AutocompletePrediction[];
  isLoading: boolean;
  onSelect: (place: AddressWithCoordinates) => void;
  onClose: () => void;
}

export function LocationSuggestions({
  isOpen,
  suggestions,
  isLoading,
  onSelect,
  onClose,
}: LocationSuggestionsProps) {
  if (!isOpen) return null;

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Search for a location..." />
      <CommandEmpty>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2">Searching...</span>
          </div>
        ) : (
          'No results found.'
        )}
      </CommandEmpty>
      <CommandGroup>
        {suggestions.map((suggestion) => (
          <CommandItem
            key={suggestion.place_id}
            onSelect={() => {
              onSelect(suggestion);
              onClose();
            }}
          >
            <span>{suggestion.description}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );
}