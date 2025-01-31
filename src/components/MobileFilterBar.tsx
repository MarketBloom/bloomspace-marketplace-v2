import { useState } from "react";
import { useRouter } from "next/router";
import { LocationSearchInput } from "@/components/location/LocationSearchInput";
import { DatePicker } from "@/components/DatePicker";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format";

export function MobileFilterBar() {
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
    <div className="flex flex-col gap-6 w-full bg-[#EED2D8] rounded-xl border border-[#4A4F41]/10 p-4">
      {/* Location Input */}
      <div>
        <label className="block text-sm font-medium text-[#4A4F41] mb-2">
          Where
        </label>
        <LocationSearchInput
          value={location}
          onChange={setLocation}
          className="w-full"
          placeholder="Enter your location"
        />
      </div>

      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-[#4A4F41] mb-2">
          When
        </label>
        <DatePicker
          value={date}
          onChange={setDate}
          className="w-full"
          placeholder="Select date"
        />
      </div>

      {/* Budget Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-[#4A4F41]">
            Budget
          </label>
          <span className="text-sm text-[#4A4F41]/70">
            {formatPrice(budget[0])} - {budget[1] >= 500 ? "$500+" : formatPrice(budget[1])}
          </span>
        </div>
        <Slider
          value={budget}
          onValueChange={setBudget}
          min={0}
          max={500}
          step={10}
          className="[&_[role=slider]]:bg-[#4A4F41] [&_[role=slider]]:border-[#4A4F41]"
        />
      </div>

      {/* Delivery Type Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => setDeliveryType("delivery")}
          className={deliveryType === "delivery" 
            ? "bg-[#4A4F41] text-[#E8E3DD]" 
            : "bg-white/50 text-[#4A4F41] hover:bg-white/70"}
        >
          Delivery
        </Button>
        <Button
          onClick={() => setDeliveryType("pickup")}
          className={deliveryType === "pickup" 
            ? "bg-[#4A4F41] text-[#E8E3DD]" 
            : "bg-white/50 text-[#4A4F41] hover:bg-white/70"}
        >
          Pickup
        </Button>
      </div>

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        className="w-full bg-[#4A4F41] text-[#E8E3DD]"
      >
        Search
      </Button>
    </div>
  );
} 