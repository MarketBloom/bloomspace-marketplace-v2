import { useState } from "react";
import { useRouter } from "next/router";
import { LocationSearchInput } from "@/components/location/LocationSearchInput";
import { DatePicker } from "@/components/DatePicker";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format";

export function HomeFilterBar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState([0, 500]);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");

  const handleSearch = () => {
    router.push({
      pathname: "/search",
      query: {
        location,
        date: date?.toISOString(),
        minPrice: budget[0],
        maxPrice: budget[1],
        deliveryType,
      },
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#EED2D8] rounded-xl border border-[#4A4F41]/10 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#4A4F41] mb-2">
            Where
          </label>
          <Location value={location} onChange={setLocation} />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#4A4F41] mb-2">
            When
          </label>
          <Date value={date} onChange={setDate} />
        </div>

        <div className="col-span-1">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[#4A4F41]">
              Budget
            </label>
            <BudgetDisplay value={budget} />
          </div>
          <Budget value={budget} onChange={setBudget} />
        </div>

        <div className="col-span-1">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <DeliveryButton 
              active={deliveryType === "delivery"} 
              onClick={() => setDeliveryType("delivery")} 
            />
            <PickupButton 
              active={deliveryType === "pickup"} 
              onClick={() => setDeliveryType("pickup")} 
            />
          </div>
          <SearchButton onClick={handleSearch} />
        </div>
      </div>
    </div>
  );
}

// Individual components for mobile flexibility
HomeFilterBar.Location = function Location({ className = "", value, onChange }: any) {
  return (
    <LocationSearchInput
      value={value}
      onChange={onChange}
      className={`bg-white/80 backdrop-blur-sm border border-[#4A4F41]/10 h-12 rounded-lg px-4 ${className}`}
      placeholder="Enter your location"
    />
  );
};

HomeFilterBar.Date = function Date({ className = "", value, onChange }: any) {
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      className={`bg-white/80 backdrop-blur-sm border border-[#4A4F41]/10 h-12 rounded-lg px-4 ${className}`}
      placeholder="Select date"
    />
  );
};

HomeFilterBar.Budget = function Budget({ className = "", value, onChange }: any) {
  return (
    <Slider
      value={value}
      onChange={onChange}
      min={0}
      max={500}
      step={10}
      className={className}
    />
  );
};

HomeFilterBar.BudgetDisplay = function BudgetDisplay({ value = [0, 500] }: any) {
  const formattedMin = formatPrice(value[0]);
  const formattedMax = value[1] >= 500 ? "$500+" : formatPrice(value[1]);
  return (
    <span className="text-sm text-[#4A4F41]/70">
      {formattedMin} - {formattedMax}
    </span>
  );
};

HomeFilterBar.DeliveryButton = function DeliveryButton({ 
  active, 
  onClick,
  className = "",
  inactiveClassName = ""
}: any) {
  return (
    <Button
      onClick={onClick}
      className={active ? className : inactiveClassName}
    >
      Delivery
    </Button>
  );
};

HomeFilterBar.PickupButton = function PickupButton({ 
  active, 
  onClick,
  className = "",
  inactiveClassName = ""
}: any) {
  return (
    <Button
      onClick={onClick}
      className={active ? className : inactiveClassName}
    >
      Pickup
    </Button>
  );
};

HomeFilterBar.SearchButton = function SearchButton({ onClick, className = "" }: any) {
  return (
    <Button
      onClick={onClick}
      className={`w-full h-12 bg-[#4A4F41] text-[#E8E3DD] rounded-lg font-medium ${className}`}
    >
      Search
    </Button>
  );
}; 