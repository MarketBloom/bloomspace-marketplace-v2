import { hereApi } from "@/services/here-api";

// Test function to compare direct vs driving distance
async function testDistanceCalculation() {
  // Example: Sydney CBD to Bondi Beach
  const sydney = { lat: -33.8688, lng: 151.2093 };
  const bondi = { lat: -33.8915, lng: 151.2767 };

  try {
    const route = await hereApi.calculateRoute(sydney, bondi);
    
    // Log the results
    console.log('Route from Sydney CBD to Bondi Beach:');
    console.log(`Driving distance: ${(route.distance / 1000).toFixed(2)} km`);
    console.log(`Estimated driving time: ${(route.duration / 60).toFixed(0)} minutes`);
    
    return route;
  } catch (error) {
    console.error('Failed to calculate route:', error);
    return null;
  }
}

export { testDistanceCalculation };
