import type { FloristProfile } from '@/types/florist';

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Parse coordinates from various formats into a standard format
 */
export function parseCoordinates(coords: any): Coordinates | null {
  if (!coords) return null;

  // If coords is already in the correct format
  if (typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
    const { lat, lng } = coords;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return { lat, lng };
    }
  }

  // If coords is a PostGIS point string (e.g., "(lat,lng)")
  if (typeof coords === 'string') {
    try {
      const matches = coords.match(/\(([-\d.]+),([-\d.]+)\)/);
      if (matches) {
        const lat = parseFloat(matches[1]);
        const lng = parseFloat(matches[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    } catch (e) {
      console.warn('Failed to parse coordinates string:', coords);
    }
  }

  return null;
}

/**
 * Ensure florist profile has valid coordinates
 */
export function validateFloristCoordinates(florist: FloristProfile): FloristProfile {
  const coords = parseCoordinates(florist.coordinates);
  return {
    ...florist,
    coordinates: coords,
  };
}
