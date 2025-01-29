import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const occasions = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Sympathy",
  "Get Well",
  "Thank You",
  "Congratulations",
  "New Baby",
];

const flowerTypes = [
  "Roses",
  "Lilies",
  "Tulips",
  "Sunflowers",
  "Orchids",
  "Carnations",
  "Daisies",
  "Mixed",
];

const colors = [
  { name: "Red", class: "bg-red-500" },
  { name: "Pink", class: "bg-pink-500" },
  { name: "Yellow", class: "bg-yellow-500" },
  { name: "White", class: "bg-white border-2 border-gray-200" },
  { name: "Purple", class: "bg-purple-500" },
  { name: "Orange", class: "bg-orange-500" },
  { name: "Blue", class: "bg-blue-500" },
  { name: "Mixed", class: "bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500" },
];

export function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [deliveryOnly, setDeliveryOnly] = useState(false);

  const updateFilters = (key: string, value: string | null) => {
    if (value === null) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-6">
      {/* Delivery/Pickup Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Delivery Options</h3>
        <div className="flex items-center space-x-2">
          <Switch
            id="delivery-only"
            checked={deliveryOnly}
            onCheckedChange={(checked) => {
              setDeliveryOnly(checked);
              updateFilters("delivery", checked ? "true" : null);
            }}
          />
          <Label htmlFor="delivery-only">Show only items available for delivery</Label>
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Price Range</h3>
        <Slider
          min={0}
          max={200}
          step={10}
          value={priceRange}
          onValueChange={(value) => {
            setPriceRange(value);
            updateFilters("minPrice", value[0].toString());
            updateFilters("maxPrice", value[1].toString());
          }}
          className="w-full"
        />
        <div className="mt-2 flex justify-between text-sm text-gray-500">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Occasion Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Occasion</h3>
        <RadioGroup
          value={searchParams.get("occasion") || ""}
          onValueChange={(value) => updateFilters("occasion", value)}
        >
          <div className="grid grid-cols-2 gap-2">
            {occasions.map((occasion) => (
              <div key={occasion} className="flex items-center space-x-2">
                <RadioGroupItem value={occasion.toLowerCase()} id={`occasion-${occasion}`} />
                <Label htmlFor={`occasion-${occasion}`}>{occasion}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Flower Type Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Flower Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {flowerTypes.map((type) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className={cn(
                "justify-start",
                searchParams.get("type") === type.toLowerCase() && "bg-primary/10"
              )}
              onClick={() =>
                updateFilters(
                  "type",
                  searchParams.get("type") === type.toLowerCase() ? null : type.toLowerCase()
                )
              }
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Color</h3>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              className={cn(
                "h-8 w-8 rounded-full",
                color.class,
                searchParams.get("color") === color.name.toLowerCase() &&
                  "ring-2 ring-primary ring-offset-2"
              )}
              onClick={() =>
                updateFilters(
                  "color",
                  searchParams.get("color") === color.name.toLowerCase()
                    ? null
                    : color.name.toLowerCase()
                )
              }
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSearchParams(new URLSearchParams());
          setPriceRange([0, 200]);
          setDeliveryOnly(false);
        }}
      >
        Clear All Filters
      </Button>
    </div>
  );
} 