import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useFlorist } from '@/hooks/useFlorist';
import { validateAddress } from '@/utils/validation';
import { formatAddress } from '@/utils/geo';
import type { Address } from '@/types/schema';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{
    title: string;
    address: Partial<Address>;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { searchAddress } = useFlorist();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchAddress(debouncedSearchTerm);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm, searchAddress]);

  const handleSuggestionSelect = (suggestion: typeof suggestions[0]) => {
    const newAddress = suggestion.address as Address;
    const validation = validateAddress(newAddress);
    
    if (!validation.success && onValidationError) {
      onValidationError(validation.error || 'Invalid address');
      return;
    }
    
    onChange(newAddress);
    setSearchTerm('');
    setSuggestions([]);
  };

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
      {/* Search Bar */}
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
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

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
