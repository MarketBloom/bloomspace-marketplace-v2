export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceResult extends google.maps.places.PlaceResult {
  formatted_address: string;
  geometry: {
    location: google.maps.LatLng;
  };
}

export interface DeliveryCheckResult {
  isWithinRange: boolean;
  distance: number;
  estimatedDuration: number;
}

export interface MatchedSubstring {
  length: number;
  offset: number;
}

export interface StructuredFormatting {
  main_text: string;
  main_text_matched_substrings: MatchedSubstring[];
  secondary_text: string;
}

export interface AutocompletePrediction {
  description: string;
  matched_substrings: MatchedSubstring[];
  place_id: string;
  structured_formatting: StructuredFormatting;
  terms: Array<{
    offset: number;
    value: string;
  }>;
  types: string[];
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface AddressResult {
  formatted_address: string;
  address_components: AddressComponent[];
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  place_id: string;
} 