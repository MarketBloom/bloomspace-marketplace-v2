import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DateFilter } from "./home-filters/DateFilter";
import { BudgetFilter } from "./home-filters/BudgetFilter";
import { Button } from "./ui/button";
import { RainbowButton } from "./ui/rainbow-button";
import { ShoppingBag, Truck } from "lucide-react";
import { ShineBorder } from "./ui/shine-border";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { supabase } from "@/integrations/supabase/client";
import { AddressAutocomplete } from '@/components/address/AddressAutocomplete';
import { AddressWithCoordinates } from '@/types/address';

interface HomeFilterBarProps {
  onLocationSelect: (location: AddressWithCoordinates) => void;
  selectedLocation?: AddressWithCoordinates;
}

export const HomeFilterBar: React.FC<HomeFilterBarProps> = ({
  onLocationSelect,
  selectedLocation
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [budget, setBudget] = useState<number[]>([500]);
  const [location, setLocation] = useState<string>("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{
    suburb: string;
    state: string;
    postcode: string;
    latitude: number;
    longitude: number;
  }>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Parse search term into components
  const parseSearchTerm = (term: string) => {
    const parts = term.trim().split(/[\s,]+/);
    let suburb = "", state = "", postcode = "";
    
    parts.forEach(part => {
      if (part.match(/^\d{4}$/)) {
        postcode = part;
      } else if (part.length === 2 || part.length === 3) {
        state = part.toUpperCase();
      } else {
        suburb = suburb ? `${suburb} ${part}` : part;
      }
    });
    
    return { suburb: suburb.trim(), state, postcode };
  };

  // Fetch suburb suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const { suburb, state, postcode } = parseSearchTerm(debouncedSearchTerm);
        
        let query = supabase
          .from('australian_suburbs')
          .select('*');

        // Build query based on parsed components
        if (suburb) {
          query = query.ilike('suburb', `${suburb}%`);
        }
        if (state) {
          query = query.ilike('state', state);
        }
        if (postcode) {
          query = query.eq('postcode', postcode);
        }

        const { data, error } = await query.limit(10);

        if (error) throw error;

        setSuggestions(data || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        toast({
          title: "Error",
          description: "Failed to load location suggestions",
          variant: "destructive"
        });
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  const handleSearch = () => {
    if (isSearching) return;
    
    setIsSearching(true);
    
    try {
      if (!location || !coordinates) {
        toast({
          title: "Location Required",
          description: "Please select a valid location from the suggestions",
          variant: "destructive"
        });
        setIsSearching(false);
        return;
      }

      const searchParams = new URLSearchParams();
      
      // Add location and coordinates
      searchParams.set('location', location);
      searchParams.set('lat', coordinates[0].toString());
      searchParams.set('lng', coordinates[1].toString());
      
      // Add date if selected
      if (date) {
        const now = new Date();
        const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
        searchParams.set('date', isToday ? now.toISOString() : date.toISOString());
      }
      
      // Add budget
      if (budget && budget.length > 0) {
        searchParams.set('budget', budget[0].toString());
      }

      // Navigate to search page with parameters
      navigate({
        pathname: "/search",
        search: searchParams.toString()
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location selection from suggestions
  const handleLocationSelect = (selectedLocation: {
    suburb: string;
    state: string;
    postcode: string;
    latitude: number;
    longitude: number;
  }) => {
    const locationString = `${selectedLocation.suburb}, ${selectedLocation.state} ${selectedLocation.postcode}`;
    setLocation(locationString);
    setCoordinates([selectedLocation.latitude, selectedLocation.longitude]);
    setSuggestions([]); // Clear suggestions after selection
    setSearchTerm(""); // Clear search term
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Find Local Florists</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Location
            </label>
            <AddressAutocomplete
              onAddressSelect={onLocationSelect}
              defaultValue={selectedLocation?.formattedAddress}
              placeholder="Enter your delivery address"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};