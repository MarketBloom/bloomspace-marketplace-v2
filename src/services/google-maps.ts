import { Loader } from '@googlemaps/js-api-loader';
import type { Address, AddressWithCoordinates, Coordinates as AddressCoordinates } from '../types/address';

export interface GoogleMapsConfig {
  apiKey: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DistanceResult {
  distance: number;
  duration: number;
}

export interface AddressComponent {
  street_number?: string;
  route?: string;
  subpremise?: string;
  locality?: string;
  administrative_area_level_1?: string;
  postal_code?: string;
  country?: string;
}

class GoogleMapsService {
  private geocoder: google.maps.Geocoder | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private loader: Loader | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeGoogleMaps();
  }

  private async initializeGoogleMaps() {
    if (this.isInitialized) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not found in environment variables');
      return;
    }

    this.loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      region: 'AU',
      language: 'en-AU'
    });

    try {
      await this.loader.load();
      this.geocoder = new google.maps.Geocoder();
      
      // Create a map div that stays in the DOM
      const mapDiv = document.createElement('div');
      mapDiv.style.display = 'none';
      document.body.appendChild(mapDiv);
      
      // Initialize a map (required for PlacesService)
      const map = new google.maps.Map(mapDiv, {
        center: { lat: -25.2744, lng: 133.7751 }, // Center of Australia
        zoom: 4
      });
      
      this.placesService = new google.maps.places.PlacesService(map);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeGoogleMaps();
    }
  }

  async searchAddress(query: string): Promise<google.maps.places.AutocompletePrediction[]> {
    await this.ensureInitialized();
    
    if (!this.placesService) {
      throw new Error('Google Places service not initialized');
    }

    try {
      // Use the new Places API
      const request = {
        input: query,
        componentRestrictions: { country: 'au' },
        types: ['address'],
        fields: ['formatted_address', 'geometry', 'place_id']
      };

      return new Promise((resolve, reject) => {
        const service = new google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          request,
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(predictions);
            } else {
              reject(new Error('Failed to get place predictions'));
            }
          }
        );
      });
    } catch (error) {
      console.error('Error searching address:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<AddressWithCoordinates> {
    await this.ensureInitialized();
    
    if (!this.placesService) {
      throw new Error('Google Places service not initialized');
    }

    try {
      const request = {
        placeId: placeId,
        fields: ['formatted_address', 'geometry', 'address_components']
      };

      return new Promise((resolve, reject) => {
        this.placesService!.getDetails(request, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const address: Partial<AddressWithCoordinates> = {
              formatted_address: place.formatted_address,
              coordinates: {
                latitude: place.geometry?.location?.lat() || 0,
                longitude: place.geometry?.location?.lng() || 0
              }
            };

            // Parse address components
            place.address_components?.forEach(component => {
              const types = component.types;

              if (types.includes('street_number')) {
                address.street_number = component.long_name;
              } else if (types.includes('route')) {
                address.street_name = component.long_name;
              } else if (types.includes('subpremise')) {
                address.unit_number = component.long_name;
              } else if (types.includes('locality') || types.includes('sublocality')) {
                address.suburb = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                address.state = component.short_name;
              } else if (types.includes('postal_code')) {
                address.postcode = component.long_name;
              } else if (types.includes('country')) {
                address.country = component.long_name;
              }
            });

            if (!address.country) {
              address.country = 'Australia';
            }

            resolve(address as AddressWithCoordinates);
          } else {
            reject(new Error('Failed to get place details'));
          }
        });
      });
    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  }

  async calculateDistance(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<DistanceResult> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const service = new google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix(
        {
          origins: [{ lat: origin.lat, lng: origin.lng }],
          destinations: [{ lat: destination.lat, lng: destination.lng }],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === 'OK' && response) {
            const element = response.rows[0].elements[0];
            resolve({
              distance: element.distance.value / 1000, // Convert to km
              duration: element.duration.value / 60 // Convert to minutes
            });
          } else {
            reject(new Error('Failed to calculate distance'));
          }
        }
      );
    });
  }

  async isWithinDeliveryRadius(
    floristLocation: Coordinates,
    customerLocation: Coordinates,
    radiusKm: number
  ): Promise<boolean> {
    try {
      const { distance } = await this.calculateDistance(floristLocation, customerLocation);
      return distance <= radiusKm;
    } catch (error) {
      console.error('Error checking delivery radius:', error);
      return false;
    }
  }
}

export const googleMapsService = new GoogleMapsService(); 