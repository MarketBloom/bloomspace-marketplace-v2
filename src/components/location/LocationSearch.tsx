import { EnhancedLocationSearch } from './EnhancedLocationSearch';

interface LocationSearchProps {
  onLocationSelect?: (location: { 
    suburb: string;
    state: string;
    postcode: string;
    latitude: number;
    longitude: number;
  }) => void;
  placeholder?: string;
  className?: string;
}

export const LocationSearch = ({ 
  onLocationSelect = () => {}, 
  placeholder,
  className 
}: LocationSearchProps) => {
  return (
    <EnhancedLocationSearch
      onLocationSelect={onLocationSelect}
      placeholder={placeholder}
      className={className}
    />
  );
};