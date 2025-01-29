import type { AddressWithCoordinates } from '@/types/address';

export interface DistanceResult {
  distance: number; // in meters
  duration: number; // in seconds
}

export async function calculateDistance(
  origin: AddressWithCoordinates,
  destination: AddressWithCoordinates
): Promise<DistanceResult> {
  const service = new google.maps.DistanceMatrixService();
  
  try {
    const response = await service.getDistanceMatrix({
      origins: [{ lat: origin.coordinates.lat, lng: origin.coordinates.lng }],
      destinations: [{ lat: destination.coordinates.lat, lng: destination.coordinates.lng }],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    });

    if (response.rows[0]?.elements[0]?.status === 'OK') {
      const element = response.rows[0].elements[0];
      return {
        distance: element.distance.value,
        duration: element.duration.value,
      };
    }

    throw new Error('Could not calculate distance');
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw error;
  }
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function isWithinRadius(
  center: AddressWithCoordinates,
  point: AddressWithCoordinates,
  radiusKm: number
): boolean {
  const R = 6371; // Earth's radius in kilometers
  const lat1 = center.coordinates.lat * Math.PI / 180;
  const lat2 = point.coordinates.lat * Math.PI / 180;
  const deltaLat = (point.coordinates.lat - center.coordinates.lat) * Math.PI / 180;
  const deltaLng = (point.coordinates.lng - center.coordinates.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance <= radiusKm;
}

export function getAddressComponent(
  place: google.maps.places.PlaceResult,
  type: string,
  format: 'short' | 'long' = 'long'
): string | undefined {
  const component = place.address_components?.find(
    (component) => component.types.includes(type)
  );
  return component ? component[format === 'short' ? 'short_name' : 'long_name'] : undefined;
}

export function parseGooglePlace(place: google.maps.places.PlaceResult): AddressWithCoordinates {
  return {
    placeId: place.place_id || '',
    description: place.name || '',
    formattedAddress: place.formatted_address || '',
    coordinates: {
      lat: place.geometry?.location?.lat() || 0,
      lng: place.geometry?.location?.lng() || 0,
    },
    addressComponents: {
      streetNumber: getAddressComponent(place, 'street_number'),
      route: getAddressComponent(place, 'route'),
      locality: getAddressComponent(place, 'locality'),
      area: getAddressComponent(place, 'administrative_area_level_2'),
      state: getAddressComponent(place, 'administrative_area_level_1'),
      country: getAddressComponent(place, 'country'),
      postalCode: getAddressComponent(place, 'postal_code'),
    },
  };
}
