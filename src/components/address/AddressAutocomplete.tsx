/** @jsxImportSource react */
import React, { useEffect, useRef } from 'react';
import { useGooglePlaces } from '../../hooks/useGooglePlaces';
import type { AddressWithCoordinates } from '../../types/address';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Loader2 } from 'lucide-react';

interface AddressAutocompleteProps {
  onAddressSelect?: (address: AddressWithCoordinates) => void;
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
  initialValue?: string;
  className?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({
  onAddressSelect = () => {},
  onChange = () => {},
  value,
  placeholder = 'Enter your suburb',
  initialValue = '',
  className = '',
  disabled = false,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { initAutocomplete, clearAutocomplete, isLoading } = useGooglePlaces({
    initialValue: value || initialValue,
    onAddressSelect,
  });

  useEffect(() => {
    if (inputRef.current) {
      initAutocomplete(inputRef.current);
    }
    return () => {
      clearAutocomplete();
    };
  }, [initAutocomplete, clearAutocomplete]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        defaultValue={value || initialValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full pr-10",
          "placeholder:text-gray-400 text-gray-900",
          "focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}

AddressAutocomplete.displayName = 'AddressAutocomplete';