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
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private loader: Loader | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private mapDiv: HTMLDivElement | null = null;

  constructor() {
    // Start loading the script immediately but don't wait for it
    this.initializeGoogleMaps().catch(console.error);
  }

  private async initializeGoogleMaps() {
    if (this.isInitialized) return;

    // If already initializing, return the existing promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Maps API key not found in environment variables');
      }

      if (!this.loader) {
        this.loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry'],
          region: 'AU',
          language: 'en-AU'
        });
      }

      try {
        await this.loader.load();
        
        // Initialize services
        this.geocoder = new google.maps.Geocoder();
        this.autocompleteService = new google.maps.places.AutocompleteService();
        
        // Create a map div that stays in the DOM if it doesn't exist
        if (!this.mapDiv) {
          this.mapDiv = document.createElement('div');
          this.mapDiv.style.display = 'none';
          document.body.appendChild(this.mapDiv);
          
          // Initialize a map (required for PlacesService)
          const map = new google.maps.Map(this.mapDiv, {
            center: { lat: -25.2744, lng: 133.7751 }, // Center of Australia
            zoom: 4
          });
          
          this.placesService = new google.maps.places.PlacesService(map);
        }
        
        this.isInitialized = true;
      } catch (error) {
        this.isInitialized = false;
        this.initializationPromise = null;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeGoogleMaps();
    }
  }

  async searchAddress(
    query: string,
    mode: 'address' | 'business' = 'address'
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    if (!query || query.length < 3) {
      return [];
    }

    await this.ensureInitialized();
    
    if (!this.autocompleteService) {
      throw new Error('Google Places service not initialized');
    }

    try {
      const request = {
        input: query,
        componentRestrictions: { country: 'au' },
        types: mode === 'business' ? ['establishment'] : ['geocode'],
      };

      return new Promise((resolve, reject) => {
        this.autocompleteService!.getPlacePredictions(
          request,
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(predictions);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              resolve([]);
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
        fields: ['formatted_address', 'geometry', 'address_components', 'name', 'website', 'formatted_phone_number', 'opening_hours', 'photos']
      };

      return new Promise((resolve, reject) => {
        this.placesService!.getDetails(request, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const coordinates = {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            };

            const addressComponents = place.address_components || [];
            const address: AddressWithCoordinates = {
              placeId: place.place_id || '',
              description: place.name || place.formatted_address || '',
              formattedAddress: place.formatted_address || '',
              coordinates,
              addressComponents: {
                streetNumber: addressComponents.find(c => c.types.includes('street_number'))?.long_name,
                route: addressComponents.find(c => c.types.includes('route'))?.long_name,
                locality: addressComponents.find(c => c.types.includes('locality'))?.long_name,
                area: addressComponents.find(c => c.types.includes('sublocality'))?.long_name,
                state: addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.short_name,
                country: 'Australia',
                postalCode: addressComponents.find(c => c.types.includes('postal_code'))?.long_name
              },
              businessDetails: place.name ? {
                name: place.name,
                website: place.website || '',
                phone: place.formatted_phone_number || '',
                openingHours: place.opening_hours?.weekday_text || [],
                photos: place.photos?.map(photo => ({
                  url: photo.getUrl(),
                  height: photo.height,
                  width: photo.width
                })) || []
              } : undefined
            };

            resolve(address);
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