import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MapPin, Loader2, Search, Building2 } from 'lucide-react';
import { useGooglePlaces } from '../../hooks/useGooglePlaces';
import { validateAddress } from '../../utils/validation';
import { formatAddress, convertToAddress } from '../../types/address';
import type { Address } from '../../types/address';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface AddressInputProps {
  value: Partial<Address>;
  onChange: (address: Address) => void;
  onValidationError?: (error: string) => void;
  className?: string;
}

export function AddressInput({
  value,
  onChange,
  onValidationError,
  className = '',
}: AddressInputProps) {
  const [searchMode, setSearchMode] = useState<'address' | 'business'>('address');
  
  const {
    inputValue: searchTerm,
    setInputValue: setSearchTerm,
    isLoading,
    suggestions,
    handleSuggestionSelect,
    initAutocomplete,
    error
  } = useGooglePlaces({
    mode: searchMode,
    onAddressSelect: (addressWithCoords) => {
      const newAddress = convertToAddress(addressWithCoords);
      const validation = validateAddress(newAddress);
      
      if (!validation.success && onValidationError) {
        onValidationError(validation.error || 'Invalid address');
        return;
      }

      onChange(newAddress);
      setSearchTerm('');
    },
    onError: (error) => {
      if (onValidationError) {
        onValidationError(error.message);
      }
    }
  });

  const handleFieldChange = (
    field: keyof Address,
    fieldValue: string
  ) => {
    const newAddress = {
      ...value,
      [field]: fieldValue,
    } as Address;

    const validation = validateAddress(newAddress);
    if (!validation.success && onValidationError) {
      onValidationError(validation.error || 'Invalid address');
    }

    onChange(newAddress);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Tabs defaultValue="address" onValueChange={(value) => setSearchMode(value as 'address' | 'business')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="address">
            <MapPin className="w-4 h-4 mr-2" />
            Search Address
          </TabsTrigger>
          <TabsTrigger value="business">
            <Building2 className="w-4 h-4 mr-2" />
            Find Business
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="address" className="space-y-4">
          {/* Address Search */}
          <div className="relative">
            <Label htmlFor="address-search">Search Address</Label>
            <div className="relative">
              <Input
                id="address-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Start typing to search..."
                className="pl-10"
                ref={(input) => {
                  if (input) {
                    initAutocomplete(input);
                  }
                }}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
                <ul className="py-1">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion.place_id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      {suggestion.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          {/* Business Search */}
          <div className="relative">
            <Label htmlFor="business-search">Search Business</Label>
            <div className="relative">
              <Input
                id="business-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter business name..."
                className="pl-10"
                ref={(input) => {
                  if (input) {
                    initAutocomplete(input);
                  }
                }}
              />
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
              )}
            </div>

            {/* Business Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
                <ul className="py-1">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion.place_id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      {suggestion.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Manual Input Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="street_number">Street Number *</Label>
          <Input
            id="street_number"
            value={value.street_number || ''}
            onChange={(e) => handleFieldChange('street_number', e.target.value)}
            placeholder="e.g. 123"
          />
        </div>
        <div>
          <Label htmlFor="street_name">Street Name *</Label>
          <Input
            id="street_name"
            value={value.street_name || ''}
            onChange={(e) => handleFieldChange('street_name', e.target.value)}
            placeholder="e.g. Main Street"
          />
        </div>
        <div>
          <Label htmlFor="unit_number">Unit Number (Optional)</Label>
          <Input
            id="unit_number"
            value={value.unit_number || ''}
            onChange={(e) => handleFieldChange('unit_number', e.target.value)}
            placeholder="e.g. 4B"
          />
        </div>
        <div>
          <Label htmlFor="suburb">Suburb *</Label>
          <Input
            id="suburb"
            value={value.suburb || ''}
            onChange={(e) => handleFieldChange('suburb', e.target.value)}
            placeholder="e.g. Richmond"
          />
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={value.state || ''}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            placeholder="e.g. VIC"
          />
        </div>
        <div>
          <Label htmlFor="postcode">Postcode *</Label>
          <Input
            id="postcode"
            value={value.postcode || ''}
            onChange={(e) => handleFieldChange('postcode', e.target.value)}
            placeholder="e.g. 3121"
          />
        </div>
      </div>

      {/* Preview */}
      {value && Object.keys(value).length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <Label className="text-sm text-gray-500">Formatted Address:</Label>
          <p className="text-sm font-medium">{formatAddress(value)}</p>
        </div>
      )}
    </div>
  );
}
