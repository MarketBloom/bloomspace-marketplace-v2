import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useDeliveryCheck } from "@/hooks/useDeliveryCheck";
import { Coordinates } from "@/types/google-maps";

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
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
    searchParams.getAll('occasions') || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll('categories') || []
  );
  const [priceRange, setPriceRange] = useState<number[]>([
    Number(searchParams.get('budget')) || 100
  ]);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  // Get search parameters
  const location = searchParams.get('location');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const date = searchParams.get('date');

  // Initialize delivery check hook
  const { filterFlorists } = useDeliveryCheck();

  // Set coordinates from URL params
  useEffect(() => {
    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      
      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        toast({
          title: "Invalid Coordinates",
          description: "The location coordinates are invalid. Please try searching again.",
          variant: "destructive"
        });
      } else {
        setCoordinates({ lat: parsedLat, lng: parsedLng });
      }
    }
  }, [lat, lng, toast]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['search', location, coordinates, date, selectedCategories, selectedOccasions, priceRange],
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
    enabled: !!coordinates // Only run query if we have coordinates
  });

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
    newParams.set('budget', priceRange[0].toString());
    
    setSearchParams(newParams, { replace: true });
  }, [selectedOccasions, selectedCategories, priceRange, searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">
              {location ? `Flowers in ${location}` : 'Search Results'}
            </h1>
            {date && (
              <p className="text-gray-600">Delivery on {new Date(date).toLocaleDateString()}</p>
            )}
          </div>

          {/* Mobile filter button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <FilterContent
                  selectedOccasions={selectedOccasions}
                  setSelectedOccasions={setSelectedOccasions}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="lg:grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Desktop filters */}
          <aside className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <FilterContent
                selectedOccasions={selectedOccasions}
                setSelectedOccasions={setSelectedOccasions}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
              />
            </div>
          </aside>

          {/* Product grid */}
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface FilterContentProps {
  selectedOccasions: string[];
  setSelectedOccasions: (occasions: string[]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
}

function FilterContent({
  selectedOccasions,
  setSelectedOccasions,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>$0</span>
            <span>${priceRange[0]}</span>
          </div>
        </div>
      </div>

      {/* Occasions */}
      <div>
        <h3 className="font-medium mb-4">Occasions</h3>
        <div className="space-y-3">
          {OCCASIONS.map((occasion) => (
            <div key={occasion} className="flex items-center">
              <Checkbox
                id={`occasion-${occasion}`}
                checked={selectedOccasions.includes(occasion)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedOccasions([...selectedOccasions, occasion]);
                  } else {
                    setSelectedOccasions(selectedOccasions.filter(o => o !== occasion));
                  }
                }}
              />
              <label
                htmlFor={`occasion-${occasion}`}
                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {occasion}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-medium mb-4">Categories</h3>
        <div className="space-y-3">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category]);
                  } else {
                    setSelectedCategories(selectedCategories.filter(c => c !== category));
                  }
                }}
              />
              <label
                htmlFor={`category-${category}`}
                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}