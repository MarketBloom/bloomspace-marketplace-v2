import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { AddressAutocomplete } from "./address/AddressAutocomplete";
import { MapPinIcon, TruckIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { Loader2Icon } from "lucide-react";
import { cn } from "../lib/utils";

// Keyframes for shine effect
const shineAnimation = `
  @keyframes shine {
    0% { background-position: 0% 0%; }
    50% { background-position: 100% 100%; }
    100% { background-position: 0% 0%; }
  }
`;

export function HomeFilterBar() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(100);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (date) params.set("date", date);
    if (budget) params.set("budget", budget.toString());
    params.set("type", deliveryType);
    
    // Simulate loading state
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/search?${params.toString()}`);
    }, 500);
  };

  return (
    <>
      <style>{shineAnimation}</style>
      
      <div className="relative w-full max-w-4xl">
        {/* Main container with glassmorphism */}
        <div 
          className="relative w-full bg-[#eed2d8]/80 backdrop-blur-sm rounded-lg px-3 py-4 md:p-5 z-10 shadow-[0_2px_4px_rgba(0,0,0,0.08),_0_2px_12px_rgba(0,0,0,0.06)]"
        >
          {/* Shine border effect */}
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#D73459] via-[#eed2d8] to-[#D73459] animate-[shine_14s_linear_infinite] bg-[length:200%_200%]"
            />
          </div>

          {/* Content grid */}
          <div className="relative z-20 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1.5 text-[#1D1D1F]">
                Location
              </label>
              <div className="relative">
                <AddressAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder="Enter suburb or postcode..."
                  className="pl-9 h-11 bg-white/90"
                />
                {isLoading ? (
                  <Loader2Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#1D1D1F]">
                Delivery/Pickup Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="h-11 bg-white/90"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#1D1D1F]">
                Budget
              </label>
              <div className="px-3">
                <Slider
                  value={[budget]}
                  onValueChange={([value]) => setBudget(value)}
                  min={50}
                  max={500}
                  step={10}
                  className="mt-3"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setDeliveryType("delivery");
                handleSearch();
              }}
              className={cn(
                "relative h-11 text-base font-medium",
                deliveryType === "delivery"
                  ? "bg-[#D73459] text-white hover:bg-[#D73459]/90"
                  : "bg-white text-[#1D1D1F] hover:bg-[#1D1D1F]/5",
                "disabled:opacity-50"
              )}
            >
              {isLoading ? (
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TruckIcon className="h-4 w-4 mr-2" />
              )}
              Search Delivery
            </Button>

            <Button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setDeliveryType("pickup");
                handleSearch();
              }}
              className={cn(
                "relative h-11 text-base font-medium",
                deliveryType === "pickup"
                  ? "bg-[#D73459] text-white hover:bg-[#D73459]/90"
                  : "bg-white text-[#1D1D1F] hover:bg-[#1D1D1F]/5",
                "disabled:opacity-50"
              )}
            >
              {isLoading ? (
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShoppingBagIcon className="h-4 w-4 mr-2" />
              )}
              Search Pickup
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 