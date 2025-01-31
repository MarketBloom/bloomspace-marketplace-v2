import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar as CalendarIcon, Heart, Filter, Truck, Store, Star } from "lucide-react";
import { Slider } from "./ui/slider";
import { Calendar } from "./ui/calendar-rac";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { getLocalTimeZone, today } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { useGooglePlaces } from "../hooks/useGooglePlaces";
import { useToast } from "../hooks/use-toast";
import type { AddressWithCoordinates } from "../types/address";

interface MobileHeroProps {
  onSearch?: (params: {
    location: string;
    date?: Date;
    budget?: [number, number];
    deliveryType: "delivery" | "pickup";
  }) => void;
}

export function MobileHero({ onSearch }: MobileHeroProps) {
  const navigate = useNavigate();
  const [date, setDate] = useState<DateValue | null>(null);
  const [budget, setBudget] = useState<[number, number]>([0, 500]);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const initRef = useRef(false);

  const {
    inputValue: address,
    setInputValue: setAddress,
    isLoading,
    error,
    initAutocomplete
  } = useGooglePlaces({
    onAddressSelect: useCallback((address: AddressWithCoordinates) => {
      console.log('Selected address:', address);
    }, []),
    onError: useCallback((error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }, [toast])
  });

  useEffect(() => {
    if (inputRef.current && !initRef.current) {
      initRef.current = true;
      initAutocomplete(inputRef.current).catch(console.error);
    }
  }, [initAutocomplete]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  }, [setAddress]);

  const formatDate = (date: DateValue | null) => {
    if (!date) return 'Any Date';
    return format(date.toDate(getLocalTimeZone()), 'PPP');
  };

  const handleDateSelect = (value: DateValue | null) => {
    setDate(value);
    // Close the popover after selection
    const button = document.querySelector('[aria-expanded="true"]') as HTMLButtonElement;
    if (button) button.click();
  };

  const handleSearch = () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please enter a location",
        variant: "destructive"
      });
      return;
    }

    if (onSearch) {
      onSearch({
        location: address,
        date: date?.toDate(getLocalTimeZone()),
        budget,
        deliveryType,
      });
    } else {
      const params = new URLSearchParams();
      params.set("location", address);
      if (date) params.set("date", date.toDate(getLocalTimeZone()).toISOString());
      params.set("minPrice", budget[0].toString());
      params.set("maxPrice", budget[1].toString());
      params.set("deliveryType", deliveryType);
      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <>
      <section className="relative h-[70vh] bg-[#4A4F41] overflow-hidden">
        {/* Hero Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src="/images/hero/roses-hero.jpg"
            alt="Beautiful fresh roses in natural light"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
        </div>
        
        {/* Hero Content */}
        <div className="relative h-full flex flex-col">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-center items-center px-4">
            {/* Hero Text */}
            <div className="w-full max-w-md space-y-4">
              <h1 className="text-white text-center">
                <span className="block text-5xl font-bold mb-1">Your City's</span>
                <span className="block text-5xl font-bold">Best Florists</span>
              </h1>
              <div className="space-y-1 text-center">
                <p className="text-white/90 text-lg">
                  Discover and order from carefully selected local florists. Find available same-day delivery options.
                </p>
              </div>
            </div>

            {/* Search Section */}
            <div className="w-full max-w-md mt-6 space-y-3">
              {/* Search Bar */}
              <div className="bg-white/95 rounded-2xl overflow-hidden shadow-lg">
                <div className="divide-y divide-gray-200">
                  {/* Location Input */}
                  <div className="px-4 py-3">
                    <div className="relative flex items-center h-[22px]">
                      <Search className="absolute left-0 w-3.5 h-3.5 text-[#4A4F41]/60" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={address}
                        onChange={handleInputChange}
                        placeholder="Enter suburb or postcode..."
                        className="w-full bg-transparent border-0 outline-none text-[#4A4F41] placeholder:text-[#4A4F41]/50 text-[13px] focus:ring-0 pl-5"
                      />
                    </div>
                  </div>

                  {/* Date Input */}
                  <div className="px-4 py-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left text-[13px] text-[#4A4F41] hover:text-[#4A4F41]/80 flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-[#4A4F41]/60" />
                          <span className="truncate">{formatDate(date)}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="p-0 bg-[#E8E3DD] border border-[#4A4F41]/10 shadow-lg rounded-lg" 
                        align="start"
                      >
                        <div className="p-2 border-b border-[#4A4F41]/10">
                          <button 
                            onClick={() => {
                              setDate(null);
                              const button = document.querySelector('[aria-expanded="true"]') as HTMLButtonElement;
                              if (button) button.click();
                            }}
                            className="w-full text-left px-2 py-1 text-sm text-[#4A4F41] rounded hover:bg-[#4A4F41]/10"
                          >
                            Any Date
                          </button>
                        </div>
                        <Calendar
                          value={date}
                          onChange={handleDateSelect}
                          className="p-2"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Budget Slider */}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#4A4F41]">Budget</span>
                      <span className="text-sm text-[#4A4F41]">
                        ${budget[0]} - ${budget[1]}+
                      </span>
                    </div>
                    <Slider
                      value={budget}
                      onValueChange={(value) => setBudget(value as [number, number])}
                      min={0}
                      max={500}
                      step={50}
                      className="mt-1"
                    />
                  </div>

                  {/* Delivery Type */}
                  <div className="flex items-center gap-2 px-4 py-3">
                    <button
                      onClick={() => setDeliveryType("delivery")}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        deliveryType === "delivery"
                          ? "bg-[#4A4F41] text-white"
                          : "bg-gray-100 text-[#4A4F41] hover:bg-gray-200"
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>Delivery</span>
                    </button>
                    <button
                      onClick={() => setDeliveryType("pickup")}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        deliveryType === "pickup"
                          ? "bg-[#4A4F41] text-white"
                          : "bg-gray-100 text-[#4A4F41] hover:bg-gray-200"
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Pickup</span>
                    </button>
                  </div>

                  {/* Search Button */}
                  <div className="px-4 py-3">
                    <button 
                      onClick={handleSearch}
                      className="w-full py-3 px-4 bg-[#4A4F41] text-white rounded-lg text-base font-medium hover:bg-[#4A4F41]/90 transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-[#E8E3DD]">
        <div className="max-w-md mx-auto">
          <h2 className="text-[#4A4F41] text-4xl md:text-3xl font-semibold text-center mb-4">
            <span className="block">Fresh Flowers,</span>
            <span className="block">Delivered with Care</span>
          </h2>
          <p className="text-[#4A4F41]/80 text-center mb-12">
            Discover our handpicked selection of exceptional local florists, all in one convenient place
          </p>

          <div className="grid gap-6">
            {/* Feature Cards */}
            <div className="bg-[#F8D7E3] rounded-2xl p-6">
              <h3 className="text-[#4A4F41] font-medium mb-2">Local Excellence</h3>
              <p className="text-[#4A4F41]/80 text-sm mb-4">
                Support the finest florists in your community creating stunning arrangements
              </p>
              <div className="bg-white/90 rounded-xl p-4 flex items-center justify-center">
                <Star className="w-6 h-6 text-[#4A4F41]" />
              </div>
            </div>

            <div className="bg-[#F8D7E3] rounded-2xl p-6">
              <h3 className="text-[#4A4F41] font-medium mb-2">Seamless Selection</h3>
              <p className="text-[#4A4F41]/80 text-sm mb-4">
                Browse and filter arrangements from our florists, and complete your order in one place
              </p>
              <div className="bg-white/90 rounded-xl p-4 flex items-center justify-center">
                <Heart className="w-6 h-6 text-[#4A4F41]" />
              </div>
            </div>

            <div className="bg-[#F8D7E3] rounded-2xl p-6">
              <h3 className="text-[#4A4F41] font-medium mb-2">Secure Checkout</h3>
              <p className="text-[#4A4F41]/80 text-sm mb-4">
                Shop with confidence using our safe and effortless payment system
              </p>
              <div className="bg-white/90 rounded-xl p-4 flex items-center justify-center">
                <Filter className="w-6 h-6 text-[#4A4F41]" />
              </div>
            </div>

            <div className="bg-[#F8D7E3] rounded-2xl p-6">
              <h3 className="text-[#4A4F41] font-medium mb-2">Doorstep Delivery</h3>
              <p className="text-[#4A4F41]/80 text-sm mb-4">
                Your beautiful arrangement delivered right to your door, same day available
              </p>
              <div className="bg-white/90 rounded-xl p-4 flex items-center justify-center">
                <Truck className="w-6 h-6 text-[#4A4F41]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Florists Section */}
      <section className="px-4 py-16">
        <div className="max-w-md mx-auto">
          <h2 className="text-[#4A4F41] text-2xl font-semibold mb-2">Featured Florists</h2>
          <p className="text-[#4A4F41]/80 mb-8">
            Discover our hand-picked selection of the best local florists
          </p>
          
          {/* Featured Florists Grid will be populated dynamically */}
          <div className="grid gap-4">
            {/* Placeholder for FloristCard components */}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-16 bg-[#E8E3DD]">
        <div className="max-w-md mx-auto">
          <h2 className="text-[#4A4F41] text-2xl font-semibold text-center mb-2">
            What Our Customers Say
          </h2>
          <p className="text-[#4A4F41]/80 text-center mb-8">
            Read about experiences from our happy customers across Australia
          </p>

          <div className="grid gap-4">
            {/* Testimonial Cards */}
            <div className="bg-[#F8D7E3] rounded-2xl p-6">
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#4A4F41] fill-current" />
                ))}
              </div>
              <p className="text-[#4A4F41]/80 text-sm mb-4">
                "The flowers were absolutely stunning and arrived right on time. The florist even called to confirm the delivery details. Exceptional service!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4A4F41]/10" />
                <div>
                  <p className="text-[#4A4F41] font-medium">Sarah Johnson</p>
                  <p className="text-[#4A4F41]/60 text-sm">Happy Customer</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F8D7E3] rounded-2xl p-6">
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#4A4F41] fill-current" />
                ))}
              </div>
              <p className="text-[#4A4F41]/80 text-sm mb-4">
                "I've been using BloomSpace for all my flower deliveries. The quality is consistently excellent, and the local florists are true artists."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4A4F41]/10" />
                <div>
                  <p className="text-[#4A4F41] font-medium">Michael Chen</p>
                  <p className="text-[#4A4F41]/60 text-sm">Regular Customer</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F8D7E3] rounded-2xl p-6">
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#4A4F41] fill-current" />
                ))}
              </div>
              <p className="text-[#4A4F41]/80 text-sm mb-4">
                "As an event planner, I need reliable florists. BloomSpace has never disappointed. Their network of local florists is outstanding."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4A4F41]/10" />
                <div>
                  <p className="text-[#4A4F41] font-medium">Emma Wilson</p>
                  <p className="text-[#4A4F41]/60 text-sm">Event Planner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 