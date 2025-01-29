export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface StructuredAddress {
  street_number: string;
  street_name: string;
  unit_number?: string;
  suburb: string;
  state: string;
  postcode: string;
  coordinates: Coordinates;
}

export interface AddressDetails {
  formatted_address: string;
  city: string;
  state: string;
  postcode: string;
}

export interface Address {
  street_number: string;
  street_name: string;
  unit_number?: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}

export interface AddressWithCoordinates {
  placeId: string;
  description: string;
  formattedAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  addressComponents: {
    streetNumber?: string;
    route?: string;
    locality?: string;
    area?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface AddressValidation {
  isValid: boolean;
  errors: string[];
}

// Helper to parse POINT(lng lat) format from PostGIS
export function parsePostgisPoint(point: string | null): Coordinates | null {
  if (!point) return null;
  
  try {
    // Extract numbers from POINT(lng lat) format
    const matches = point.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
    if (!matches) return null;
    
    return {
      longitude: parseFloat(matches[1]),
      latitude: parseFloat(matches[2])
    };
  } catch (error) {
    console.error('Failed to parse PostGIS point:', error);
    return null;
  }
}

// Helper to format coordinates as PostGIS point
export function formatPostgisPoint(coordinates: Coordinates | null): string | null {
  if (!coordinates) return null;
  return `POINT(${coordinates.longitude} ${coordinates.latitude})`;
}

// Helper to format address components into a single line
export function formatAddressLine(address: Partial<StructuredAddress>): string {
  const parts = [];
  
  if (address.unit_number) {
    parts.push(`${address.unit_number}/`);
  }
  
  if (address.street_number && address.street_name) {
    parts.push(`${address.street_number} ${address.street_name}`);
  }
  
  if (address.suburb) {
    parts.push(address.suburb);
  }
  
  if (address.state) {
    parts.push(address.state);
  }
  
  if (address.postcode) {
    parts.push(address.postcode);
  }
  
  return parts.join(', ');
}

// Helper to parse address string into components
export function parseAddressLine(addressLine: string): Partial<StructuredAddress> {
  // This is a basic implementation and might need to be enhanced based on address formats
  const parts = addressLine.split(',').map(part => part.trim());
  
  // Try to extract unit and street number/name from the first part
  const streetPart = parts[0];
  const unitMatch = streetPart.match(/^(\d+)\/(\d+)\s+(.+)$/);
  const streetMatch = streetPart.match(/^(\d+[A-Za-z]?)\s+(.+)$/);
  
  const result: Partial<StructuredAddress> = {};
  
  if (unitMatch) {
    result.unit_number = unitMatch[1];
    result.street_number = unitMatch[2];
    result.street_name = unitMatch[3];
  } else if (streetMatch) {
    result.street_number = streetMatch[1];
    result.street_name = streetMatch[2];
  }
  
  // Try to extract suburb, state, and postcode from remaining parts
  if (parts.length > 1) {
    result.suburb = parts[1];
  }
  
  if (parts.length > 2) {
    const statePostcodePart = parts[2];
    const statePostcodeMatch = statePostcodePart.match(/([A-Z]{2,3})\s*(\d{4})/);
    
    if (statePostcodeMatch) {
      result.state = statePostcodeMatch[1];
      result.postcode = statePostcodeMatch[2];
    }
  }
  
  return result;
}

export interface DeliveryZone {
  type: 'Polygon';
  coordinates: [number, number][];
}

export interface DeliverySettings {
  radius_km: number;
  fee: number;
  minimum_order: number;
  same_day_cutoff: string;
  next_day_cutoff_enabled: boolean;
  next_day_cutoff?: string;
}

export interface DeliverySlot {
  name: string;
  start: string;
  end: string;
  enabled: boolean;
}

export interface DeliverySchedule {
  weekdays: {
    slots: DeliverySlot[];
  };
  weekends: {
    slots: DeliverySlot[];
  };
}

export interface CartAddress extends AddressWithCoordinates {
  id?: string;
  user_id?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AddressInput {
  streetAddress: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
