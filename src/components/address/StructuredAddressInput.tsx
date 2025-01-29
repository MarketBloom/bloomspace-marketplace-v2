import { useState, useEffect } from 'react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useGooglePlaces } from '../../hooks/useGooglePlaces';
import { Button } from '../../components/ui/button';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '../../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AddressDetails {
  street_number: string;
  street_name: string;
  suburb: string;
  state: string;
  postcode: string;
  formatted_address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface Props {
  value: AddressDetails;
  onChange: (address: AddressDetails) => void;
  disabled?: boolean;
  required?: boolean;
}

const DEFAULT_ADDRESS: AddressDetails = {
  street_number: '',
  street_name: '',
  suburb: '',
  state: '',
  postcode: '',
  formatted_address: '',
};

export function StructuredAddressInput({ 
  value = DEFAULT_ADDRESS, 
  onChange, 
  disabled,
  required 
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    inputValue,
    setInputValue,
    isLoading,
    suggestions,
    handleSuggestionSelect
  } = useGooglePlaces({
    initialValue: searchQuery,
    onAddressSelect: (address) => {
      const newAddress: AddressDetails = {
        street_number: address.street_number || '',
        street_name: address.street_name || '',
        suburb: address.suburb || '',
        state: address.state || '',
        postcode: address.postcode || '',
        formatted_address: address.formatted_address,
        coordinates: {
          lat: address.coordinates.latitude,
          lng: address.coordinates.longitude
        }
      };
      onChange(newAddress);
      setSearchQuery('');
      setOpen(false);
    }
  });

  // Ensure value is never undefined
  useEffect(() => {
    if (!value) {
      onChange(DEFAULT_ADDRESS);
    }
  }, [value, onChange]);

  // Update individual fields
  const handleFieldChange = (field: keyof AddressDetails, fieldValue: string) => {
    const newAddress = {
      ...value,
      [field]: fieldValue,
      // Clear formatted_address when manually editing fields
      formatted_address: ''
    };
    onChange(newAddress);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          Search Address
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between",
                !value.formatted_address && required && "border-red-500"
              )}
              disabled={disabled}
            >
              {value.formatted_address || searchQuery || "Search for an address..."}
              {isLoading ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Type to search..."
                value={inputValue}
                onValueChange={setInputValue}
              />
              {isLoading ? (
                <CommandEmpty className="p-2">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  <span className="text-sm text-center block mt-2">Loading suggestions...</span>
                </CommandEmpty>
              ) : !suggestions?.length ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={suggestion.place_id}
                      value={suggestion.description}
                      onSelect={() => handleSuggestionSelect(suggestion)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          suggestion.description === value.formatted_address ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {suggestion.description}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
              Street Number
            </Label>
            <Input
              value={value.street_number}
              onChange={(e) => handleFieldChange('street_number', e.target.value)}
              className={cn(!value.street_number && required && "border-red-500")}
              disabled={disabled}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
              Street Name
            </Label>
            <Input
              value={value.street_name}
              onChange={(e) => handleFieldChange('street_name', e.target.value)}
              className={cn(!value.street_name && required && "border-red-500")}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
              Suburb
            </Label>
            <Input
              value={value.suburb}
              onChange={(e) => handleFieldChange('suburb', e.target.value)}
              className={cn(!value.suburb && required && "border-red-500")}
              disabled={disabled}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
              State
            </Label>
            <Input
              value={value.state}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              className={cn(!value.state && required && "border-red-500")}
              disabled={disabled}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
              Postcode
            </Label>
            <Input
              value={value.postcode}
              onChange={(e) => handleFieldChange('postcode', e.target.value)}
              className={cn(!value.postcode && required && "border-red-500")}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
