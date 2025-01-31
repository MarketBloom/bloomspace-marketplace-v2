import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useDeliveryCheck } from "@/hooks/useDeliveryCheck";
import { Coordinates } from "@/types/google-maps";
import { LocationSearchInput } from "@/components/location/LocationSearchInput";
import type { AddressWithCoordinates } from "@/types/address";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  title: string;
  price: number;
  sale_price?: number | null;
  images: string[];
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  florist: {
    id: string;
    store_name: string;
  };
  categories: string[];
  occasions: string[];
}

interface Florist {
  id: string;
  store_name: string;
  about_text: string;
  address_details: {
    suburb?: string;
    state?: string;
  };
  logo_url?: string;
  banner_url?: string;
  delivery_settings: any;
  rating?: number;
}

const OCCASIONS = [
  "Birthday", "Anniversary", "Wedding", "Sympathy",
  "Get Well", "Thank You", "New Baby", "Love & Romance"
];

const CATEGORIES = [
  "Roses", "Mixed Bouquets", "Native Flowers", "Plants",
  "Lilies", "Orchids", "Sunflowers", "Seasonal"
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'products' | 'florists'>('products');
  
  // Get search parameters from URL
  const location = searchParams.get('location');
  const date = searchParams.get('date');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const deliveryType = searchParams.get('deliveryType') as 'delivery' | 'pickup' || 'delivery';
  
  // Initialize state with URL params
  const [locationInput, setLocationInput] = useState(location || '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(date ? new Date(date) : null);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(minPrice) || 0,
    Number(maxPrice) || 500
  ]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<'delivery' | 'pickup'>(deliveryType);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
    searchParams.getAll('occasions') || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll('categories') || []
  );
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  // Initialize delivery check hook
  const { filterFlorists } = useDeliveryCheck();

  // Format price range consistently
  const formatPriceRange = () => {
    if (priceRange[1] === 500) {
      return `$${priceRange[0]} - $500+`;
    }
    return `$${priceRange[0]} - $${priceRange[1]}`;
  };

  // Handle location selection
  const handleLocationSelect = (address: AddressWithCoordinates) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('location', address.formattedAddress);
    newParams.set('lat', address.coordinates.lat.toString());
    newParams.set('lng', address.coordinates.lng.toString());
    setSearchParams(newParams, { replace: true });
    setLocationInput(address.formattedAddress);
    setCoordinates(address.coordinates);
  };

  // Set coordinates from URL params
  useEffect(() => {
    if (searchParams.get('lat') && searchParams.get('lng')) {
      const parsedLat = parseFloat(searchParams.get('lat') || '');
      const parsedLng = parseFloat(searchParams.get('lng') || '');
      
      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        toast.error("Invalid Coordinates", "The location coordinates are invalid. Please try searching again.");
      } else {
        setCoordinates({ lat: parsedLat, lng: parsedLng });
      }
    }
  }, [searchParams, toast]);

  // Query for products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['search-products', location, coordinates, date, selectedCategories, selectedOccasions, priceRange],
    queryFn: async () => {
      // First, get all florists that can deliver to the location
      let availableFloristIds: string[] = [];
      
      if (coordinates) {
        // Get current time for same-day delivery checks
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
        const isToday = date ? new Date(date).toDateString() === now.toDateString() : true;
        
        const florists = await supabase
          .from('florist_profiles')
          .select('id, coordinates, delivery_settings, delivery_slots')
          .eq('status', 'active');

        if (florists.error) throw florists.error;

        // Filter florists based on delivery radius and time rules
        const filteredFlorists = await filterFlorists(
          coordinates,
          florists.data.map(f => ({
            id: f.id,
            coordinates: f.coordinates,
            delivery_radius: f.delivery_settings.max_distance_km
          }))
        );

        // Further filter based on delivery time rules
        availableFloristIds = filteredFlorists
          .filter(f => {
            const florist = florists.data.find(fl => fl.id === f.id);
            if (!florist || !f.isWithinRange) return false;

            // Check same-day delivery cutoff
            if (isToday) {
              return currentTime <= florist.delivery_settings.same_day_cutoff;
            }

            // Check next-day cutoff if enabled
            const isTomorrow = date ? 
              new Date(date).toDateString() === new Date(now.setDate(now.getDate() + 1)).toDateString() : 
              false;

            if (isTomorrow && florist.delivery_settings.next_day_cutoff_enabled) {
              return currentTime <= florist.delivery_settings.next_day_cutoff;
            }

            // For future dates, florist is available
            return true;
          })
          .map(f => f.id);
      }

      // Then query products from those florists
      let query = supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          sale_price,
          images,
          stock_status,
          categories,
          occasions,
          florist:florist_profiles!inner (
            id,
            store_name,
            coordinates,
            delivery_radius
          )
        `)
        .eq('is_hidden', false)
        .lte('price', priceRange[0]);

      // Filter by available florists if we have coordinates
      if (coordinates && availableFloristIds.length > 0) {
        query = query.in('florist_id', availableFloristIds);
      }

      // Add category filters
      if (selectedCategories.length > 0) {
        query = query.contains('categories', selectedCategories);
      }

      // Add occasion filters
      if (selectedOccasions.length > 0) {
        query = query.contains('occasions', selectedOccasions);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform the data to match the Product interface
      return (data as any[]).map(item => ({
        ...item,
        florist: {
          id: item.florist[0].id,
          store_name: item.florist[0].store_name,
          coordinates: item.florist[0].coordinates,
          delivery_radius: item.florist[0].delivery_radius
        }
      })) as Product[];
    },
    enabled: !!coordinates && activeTab === 'products'
  });

  // Query for florists
  const { data: florists, isLoading: floristsLoading } = useQuery({
    queryKey: ['search-florists', location, coordinates, date],
    queryFn: async () => {
      if (!coordinates) return [];

      const { data, error } = await supabase
        .from('florist_profiles')
        .select(`
          id,
          store_name,
          about_text,
          address_details,
          logo_url,
          banner_url,
          delivery_settings,
          rating
        `)
        .eq('status', 'active');

      if (error) throw error;

      // Filter florists based on delivery radius
      const availableFlorists = await filterFlorists(
        coordinates,
        data.map(f => ({
          id: f.id,
          coordinates: f.coordinates,
          delivery_radius: f.delivery_settings.max_distance_km
        }))
      );

      return data.filter(florist => 
        availableFlorists.some(f => f.id === florist.id && f.isWithinRange)
      );
    },
    enabled: !!coordinates && activeTab === 'florists'
  });

  const isLoading = activeTab === 'products' ? productsLoading : floristsLoading;
  const hasResults = activeTab === 'products' ? (products?.length ?? 0) > 0 : (florists?.length ?? 0) > 0;

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    
    // Update occasions
    newParams.delete('occasions');
    selectedOccasions.forEach(occasion => newParams.append('occasions', occasion));
    
    // Update categories
    newParams.delete('categories');
    selectedCategories.forEach(category => newParams.append('categories', category));
    
    // Update price range
    newParams.set('minPrice', priceRange[0].toString());
    newParams.set('maxPrice', priceRange[1].toString());
    
    setSearchParams(newParams, { replace: true });
  }, [selectedOccasions, selectedCategories, priceRange, searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-[#E8E3DD]">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Search Form Container */}
        <div className="bg-[#EED2D8] rounded-xl border border-[#4A4F41]/10 p-6 mb-8">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold text-[#4A4F41] mb-4">
              Find Local Flowers
            </h2>
            <p className="text-lg text-[#4A4F41]/70 max-w-2xl">
              Browse our curated selection of local florists and their stunning arrangements
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Container */}
          <aside className="lg:w-[300px] shrink-0">
            <div className="bg-[#EED2D8] rounded-xl border border-[#4A4F41]/10 p-6">
              <h3 className="font-semibold text-[#4A4F41] mb-6">Filters</h3>
              
              {/* Delivery Type Toggle */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-[#4A4F41] mb-4">Delivery Method</h4>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedDeliveryType('delivery')}
                    className={`flex-1 h-10 rounded-lg font-medium text-sm transition-colors ${
                      selectedDeliveryType === 'delivery' 
                        ? 'bg-[#4A4F41] text-[#E8E3DD]' 
                        : 'bg-white/50 text-[#4A4F41] hover:bg-white/70'
                    }`}
                  >
                    Delivery
                  </button>
                  <button 
                    onClick={() => setSelectedDeliveryType('pickup')}
                    className={`flex-1 h-10 rounded-lg font-medium text-sm transition-colors ${
                      selectedDeliveryType === 'pickup' 
                        ? 'bg-[#4A4F41] text-[#E8E3DD]' 
                        : 'bg-white/50 text-[#4A4F41] hover:bg-white/70'
                    }`}
                  >
                    Pickup
                  </button>
                </div>
              </div>

              {/* Location Search */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-[#4A4F41] mb-4">Location</h4>
                <LocationSearchInput
                  onPlaceSelected={handleLocationSelect}
                  defaultValue={locationInput}
                  placeholder="Enter a suburb or postcode..."
                  className="w-full bg-white/80 backdrop-blur-sm border border-[#4A4F41]/10 h-[42px] text-[13px] rounded-lg px-4 focus:ring-0 focus:border-[#4A4F41]/20 text-[#4A4F41] placeholder:text-[#4A4F41]/50"
                />
              </div>

              {/* Date Picker */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-[#4A4F41] mb-4">Delivery Date</h4>
                <button 
                  className="w-full bg-white/80 backdrop-blur-sm border border-[#4A4F41]/10 h-[42px] px-4 rounded-lg text-left text-[13px] text-[#4A4F41]"
                  onClick={() => {/* Add date picker popup */}}
                >
                  {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-[#4A4F41]">Budget</h4>
                  <span className="text-sm text-[#4A4F41]/70">
                    {formatPriceRange()}
                  </span>
                </div>
                <Slider
                  defaultValue={[0, 500]}
                  max={500}
                  min={0}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="[&_[role=slider]]:bg-[#4A4F41] [&_[role=slider]]:border-[#4A4F41] [&_[role=slider]]:hover:bg-[#4A4F41]/90"
                />
              </div>

              {/* Occasions Filter */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-[#4A4F41] mb-4">Occasions</h4>
                <div className="space-y-3">
                  {OCCASIONS.map((occasion) => (
                    <label 
                      key={occasion}
                      className="flex items-center gap-2 text-[#4A4F41]/80 hover:text-[#4A4F41] cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedOccasions.includes(occasion)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOccasions([...selectedOccasions, occasion]);
                          } else {
                            setSelectedOccasions(selectedOccasions.filter(o => o !== occasion));
                          }
                        }}
                        className="border-[#4A4F41]/20 data-[state=checked]:bg-[#4A4F41] data-[state=checked]:border-[#4A4F41]"
                      />
                      <span className="text-sm">{occasion}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories Filter */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-[#4A4F41] mb-4">Categories</h4>
                <div className="space-y-3">
                  {CATEGORIES.map((category) => (
                    <label 
                      key={category}
                      className="flex items-center gap-2 text-[#4A4F41]/80 hover:text-[#4A4F41] cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                          }
                        }}
                        className="border-[#4A4F41]/20 data-[state=checked]:bg-[#4A4F41] data-[state=checked]:border-[#4A4F41]"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Container */}
          <div className="flex-1">
            <div className="bg-[#EED2D8] rounded-xl border border-[#4A4F41]/10 p-6">
              {/* Tabs */}
              <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`text-[#4A4F41] font-medium px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'products' 
                      ? 'bg-white/50 hover:bg-white/70' 
                      : 'hover:bg-white/50'
                  }`}
                >
                  Fresh Arrangements
                </button>
                <button 
                  onClick={() => setActiveTab('florists')}
                  className={`text-[#4A4F41] font-medium px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'florists' 
                      ? 'bg-white/50 hover:bg-white/70' 
                      : 'hover:bg-white/50'
                  }`}
                >
                  Curated Florists
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="w-8 h-8 animate-spin text-[#4A4F41]" />
                </div>
              ) : hasResults ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {activeTab === 'products' ? (
                    products?.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    florists?.map((florist) => (
                      <Link 
                        key={florist.id}
                        to={`/florist/${florist.id}`}
                        className="group relative bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
                      >
                        <div className="aspect-[4/3] overflow-hidden">
                          <img 
                            src={florist.banner_url || '/images/placeholder-store.jpg'} 
                            alt={florist.store_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-[15px] font-semibold text-[#4A4F41] mb-1">
                            {florist.store_name}
                          </h3>
                          <p className="text-sm text-[#4A4F41]/70 line-clamp-2 mb-2">
                            {florist.about_text}
                          </p>
                          <p className="text-xs text-[#4A4F41]/60">
                            {florist.address_details?.suburb}, {florist.address_details?.state}
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <p className="text-lg font-medium text-[#4A4F41] mb-2">
                    No {activeTab === 'products' ? 'products' : 'florists'} found
                  </p>
                  <p className="text-[#4A4F41]/70">
                    Try adjusting your filters or search for a different location
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}