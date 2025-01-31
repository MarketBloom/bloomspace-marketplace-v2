import { useState, useEffect, useRef } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { useLoadScript } from "@react-google-maps/api";
import { Input } from "@/components/ui/Input";

const libraries: ("places")[] = ["places"];

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function LocationSearchInput({
  value,
  onChange,
  className = "",
  placeholder = "Enter your location"
}: LocationSearchInputProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [searchValue, setSearchValue] = useState(value);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const options = {
      componentRestrictions: { country: "au" },
      types: ["(regions)"],
    };

    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      options
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.formatted_address) {
        setSearchValue(place.formatted_address);
        onChange(place.formatted_address);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={placeholder}
        className={`pl-9 ${className}`}
      />
      <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4A4F41]/60" />
    </div>
  );
}