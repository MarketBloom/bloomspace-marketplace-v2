import { googleMapsService } from '../services/google-maps';
import type { Coordinates } from '../types/google-maps';

const EARTH_RADIUS_KM = 6371;
const STRAIGHT_LINE_TO_ROAD_RATIO = 1.3; // Roads are typically 30% longer than straight-line distance

/**
 * Calculate straight-line (Haversine) distance between two points in kilometers
 */
export function calculateHaversineDistance(point1: Coordinates, point2: Coordinates): number {
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

export interface DistanceResult {
  distance: number;
  duration: number;
}

/**
 * Calculate road distance between two points using Google Maps Distance Matrix API
 */
export async function calculateRoadDistance(
  origin: Coordinates,
  destination: Coordinates
): Promise<DistanceResult> {
  try {
    const result = await googleMapsService.calculateDistance(origin, destination);
    return {
      distance: result.distance,
      duration: result.duration
    };
  } catch (error) {
    console.error('Failed to get road distance:', error);
    // Fall back to straight-line distance with a buffer
    const distance = calculateHaversineDistance(origin, destination) * STRAIGHT_LINE_TO_ROAD_RATIO;
    return {
      distance,
      duration: estimateDeliveryTime(distance)
    };
  }
}

/**
 * Estimate delivery time based on distance and average speed
 */
export function estimateDeliveryTime(distanceKm: number, averageSpeedKmh = 30): number {
  const timeHours = distanceKm / averageSpeedKmh;
  return Math.ceil(timeHours * 60); // Convert to minutes and round up
}

/**
 * Check if a delivery location is within a florist's delivery radius
 */
export async function isWithinDeliveryRadius(
  floristLocation: Coordinates,
  customerLocation: Coordinates,
  radiusKm: number
): Promise<boolean> {
  try {
    const { distance } = await calculateRoadDistance(floristLocation, customerLocation);
    return distance <= radiusKm;
  } catch (error) {
    console.error('Error checking delivery radius:', error);
    // Fallback to straight-line distance if the service fails
    return calculateHaversineDistance(floristLocation, customerLocation) <= radiusKm;
  }
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
  }>
): Promise<Array<{
  id: string;
  distance: number;
  estimatedDuration: number;
  isWithinRange: boolean;
}>> {
  const results = await Promise.all(
    florists.map(async (florist) => {
      const { distance, duration } = await calculateRoadDistance(florist.coordinates, customerLocation);
      const isWithinRange = distance <= florist.delivery_radius;
      
      return {
        id: florist.id,
        distance,
        estimatedDuration: duration || estimateDeliveryTime(distance),
        isWithinRange
      };
    })
  );
  
  // Sort by distance
  return results.sort((a, b) => a.distance - b.distance);
}