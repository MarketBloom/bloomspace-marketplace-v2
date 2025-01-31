import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Calendar as CalendarIcon, DollarSign, Store, Truck } from "lucide-react";
import { Button } from "./ui/button";
import { useGooglePlaces } from "../hooks/useGooglePlaces";
import { useToast } from "../hooks/use-toast";
import type { AddressWithCoordinates } from "../types/address";
import { Slider } from "./ui/slider";
import { Calendar } from "./ui/calendar-rac";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { Label } from "./ui/label";
import { getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { RainbowContainer } from "./ui/rainbow-container";
import { Input } from "./ui/input";

interface HeroProps {
  onSearch: (params: {
    location: string;
    date?: Date;
    budget?: [number, number];
    deliveryType: 'delivery' | 'pickup';
  }) => void;
}

export function Hero({ onSearch }: HeroProps) {
  const [date, setDate] = useState<DateValue | null>(null);
  const [budget, setBudget] = useState<[number, number]>([0, 500]);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const initRef = useRef(false);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [location, setLocation] = useState('');
  
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

  const formatPriceRange = () => {
    if (budget[1] === 500) {
      return `From $${budget[0]} to $500+`;
    }
    return `From $${budget[0]} to $${budget[1]}`;
  };

  const handleDateSelect = (value: DateValue | null) => {
    setDate(value);
    // Close the popover after selection
    const button = document.querySelector('[aria-expanded="true"]') as HTMLButtonElement;
    if (button) button.click();
  };

  const formatDate = (date: DateValue | null) => {
    if (!date) return 'Any Date or Pick a Date';
    return format(date.toDate(getLocalTimeZone()), 'PPP');
  };

  const handleBudgetChange = (value: number[]) => {
    setBudget([value[0], value[1]] as [number, number]);
  };

  const handleSearch = () => {
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please enter a location',
        variant: 'destructive'
      });
      return;
    }

    onSearch({
      location: address,
      date: date?.toDate(getLocalTimeZone()),
      budget,
      deliveryType
    });
  };

  return (
    <section className="relative h-[66vh] pt-16 flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="/images/hero/roses-hero.jpg" 
          alt="Beautiful roses arrangement"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D312A]/90 via-[#2D312A]/60 to-[#2D312A]/90" />
        
        {/* Noise texture */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }} 
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-[#E8E3DD] text-4xl md:text-7xl font-bold mb-4 md:mb-6 tracking-tight leading-none whitespace-nowrap">
            Your City's Best Florists
          </h1>
          <p className="text-[#E8E3DD]/90 text-base md:text-xl max-w-2xl mx-auto leading-snug">
            Discover and order from carefully selected local florists.<br />
            Find available same-day delivery options.
          </p>
        </div>

        {/* Search Bar with Filters */}
        <RainbowContainer className="max-w-4xl mx-auto rounded-2xl md:rounded-full overflow-hidden">
          <div className="backdrop-blur-md bg-[#E8E3DD]/95 rounded-2xl md:rounded-full">
            <div className="flex flex-col md:flex-row md:items-stretch divide-y md:divide-y-0 md:divide-x divide-[#4A4F41]/10 py-3 px-3">
              {/* Where Filter */}
              <div className="flex-[1.8] min-w-0 md:min-w-[200px] px-5 py-3 md:py-0">
                <div className="h-full flex flex-col justify-center">
                  <label className="text-xs text-[#4A4F41] mb-2.5">Where</label>
                  <div className="h-[22px] flex items-center">
                    <Input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter suburb or postcode..."
                      className="h-full w-full bg-transparent text-sm text-[#4A4F41] placeholder:text-[#4A4F41]/50 focus:outline-none border-[0.5px] border-[#4A4F41]/20 focus:border-[#4A4F41]/30"
                    />
                  </div>
                </div>
              </div>

              {/* When Filter */}
              <div className="flex-[1.4] min-w-0 md:min-w-[180px] px-5 py-3 md:py-0">
                <div className="h-full flex flex-col justify-center">
                  <label className="text-xs text-[#4A4F41] mb-2.5">When</label>
                  <div className="flex items-center h-[22px]">
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
                </div>
              </div>

              {/* Budget Filter */}
              <div className="flex-[1.4] min-w-0 md:min-w-[200px] px-5 py-3 md:py-0">
                <div className="h-full flex flex-col justify-center">
                  <div className="flex flex-col">
                    <div className="flex items-start mb-2.5">
                      <label className="text-xs text-[#4A4F41]">Budget</label>
                      <span className="text-xs text-[#4A4F41]/70 ml-auto">{formatPriceRange()}</span>
                    </div>
                    <div className="h-[22px] flex items-center">
                      <Slider
                        defaultValue={[0, 500]}
                        max={500}
                        min={0}
                        step={5}
                        value={budget}
                        onValueChange={handleBudgetChange}
                        className="w-full"
                        showTooltip
                        tooltipContent={(value) => value === 500 ? `$${value}+` : `$${value}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Buttons */}
              <div className="flex items-center justify-between px-4 py-2 md:py-0 md:pl-4 md:pr-3 flex-[0.8] min-w-[220px]">
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => setDeliveryType('delivery')}
                    variant="ghost"
                    className={`h-11 w-11 rounded-lg flex items-center justify-center transition-colors ${
                      deliveryType === 'delivery' 
                        ? 'bg-[#4A4F41] text-[#E8E3DD]' 
                        : 'bg-[#E8E3DD] hover:bg-[#E8E3DD]/90 text-[#4A4F41]'
                    }`}
                  >
                    <Truck className="h-6 w-6" strokeWidth={2} />
                  </Button>
                  <Button 
                    onClick={() => setDeliveryType('pickup')}
                    variant="ghost"
                    className={`h-11 w-11 rounded-lg flex items-center justify-center transition-colors ${
                      deliveryType === 'pickup' 
                        ? 'bg-[#4A4F41] text-[#E8E3DD]' 
                        : 'bg-[#E8E3DD] hover:bg-[#E8E3DD]/90 text-[#4A4F41]'
                    }`}
                  >
                    <Store className="h-6 w-6" strokeWidth={2} />
                  </Button>
                </div>
                <Button
                  onClick={handleSearch}
                  variant="ghost"
                  className="h-11 px-5 bg-[#4A4F41] hover:bg-[#4A4F41]/90 text-[#E8E3DD] rounded-lg ml-2"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </RainbowContainer>

        {/* Features */}
        <div className="mt-10 hidden md:flex justify-center gap-12 text-[#E8E3DD]/90 text-sm font-medium">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Find available same-day delivery
          </span>
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Filter by occasion & style
          </span>
          <span className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Secure checkout
          </span>
        </div>
      </div>
    </section>
  );
} 