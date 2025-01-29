import { googleMapsService } from './google-maps';
import type { Coordinates } from './google-maps';

const STRAIGHT_LINE_TO_ROAD_RATIO = 1.3; // Roads are typically 30% longer than straight-line distance
const EARTH_RADIUS_KM = 6371;

export async function isWithinDeliveryRadius(
  floristLocation: Coordinates,
  customerLocation: Coordinates,
  radiusKm: number
): Promise<boolean> {
  try {
    return await googleMapsService.isWithinDeliveryRadius(
      floristLocation,
      customerLocation,
      radiusKm
    );
  } catch (error) {
    console.error('Error checking delivery radius:', error);
    // Fallback to straight-line distance if the service fails
    return calculateStraightLineDistance(floristLocation, customerLocation) <= radiusKm;
  }
}

// Calculate straight-line (as the crow flies) distance between two points
function calculateStraightLineDistance(point1: Coordinates, point2: Coordinates): number {
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
  const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return EARTH_RADIUS_KM * c;
}

// Estimate road distance from straight-line distance
export function estimateRoadDistance(straightLineDistance: number): number {
  return straightLineDistance * STRAIGHT_LINE_TO_ROAD_RATIO;
}

// Calculate estimated delivery time in minutes
export function estimateDeliveryTime(distanceKm: number, averageSpeedKmh = 30): number {
  const timeHours = distanceKm / averageSpeedKmh;
  return Math.ceil(timeHours * 60); // Convert to minutes and round up
}

/**
 * Filter a list of florists based on delivery radius
 */
export async function filterFloristsByDeliveryRadius(
  customerLocation: Coordinates,
  florists: Array<{
    id: string;
    coordinates: Coordinates;
    delivery_radius: number;
  }>,
  useRoadDistance: boolean = true
): Promise<Array<{
  id: string;
  distance: number;
  estimatedDuration: number;
  isWithinRange: boolean;
}>> {
  const results = await Promise.all(
    florists.map(async (florist) => {
      const result = await isWithinDeliveryRadius(
        florist.coordinates,
        customerLocation,
        florist.delivery_radius
      );
      
      return {
        id: florist.id,
        distance: result ? calculateStraightLineDistance(florist.coordinates, customerLocation) : Infinity,
        estimatedDuration: result ? estimateDeliveryTime(calculateStraightLineDistance(florist.coordinates, customerLocation) / 1000) : Infinity,
        isWithinRange: result
      };
    })
  );
  
  // Sort by distance
  return results.sort((a, b) => a.distance - b.distance);
} 