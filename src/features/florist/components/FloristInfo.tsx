import { MapPin, Clock, DollarSign, Truck } from "lucide-react";
import { formatCurrency } from "@/utils/format";

interface FloristInfoProps {
  storeName: string;
  address: string;
  mapUrl: string | null;
  aboutText?: string | null;
  deliveryFee?: number | null;
  deliveryRadius?: number | null;
  minimumOrderAmount?: number | null;
  deliveryDistanceKm?: number | null;
  isWithinDeliveryRadius: boolean | null;
  operatingHours?: Record<string, any> | null;
}

export function FloristInfo({
  storeName,
  address,
  mapUrl,
  aboutText,
  deliveryFee,
  deliveryRadius,
  minimumOrderAmount,
  deliveryDistanceKm,
  isWithinDeliveryRadius,
  operatingHours,
}: FloristInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">{storeName}</h3>
        {mapUrl ? (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-gray-600 hover:text-gray-900"
          >
            <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
            <span>{address}</span>
          </a>
        ) : (
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
            <span>{address}</span>
          </div>
        )}
      </div>

      {aboutText && (
        <p className="text-gray-600">{aboutText}</p>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        {deliveryRadius && (
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <div>
              <span className="text-gray-600">Delivery radius: {deliveryRadius}km</span>
              {deliveryDistanceKm !== undefined && deliveryDistanceKm !== null && (
                <div className="text-xs">
                  {isWithinDeliveryRadius ? (
                    <span className="text-green-600">
                      {deliveryDistanceKm.toFixed(1)}km away - Delivers here
                    </span>
                  ) : (
                    <span className="text-red-600">
                      {deliveryDistanceKm.toFixed(1)}km away - Outside delivery area
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {deliveryFee !== null && deliveryFee !== undefined && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <div>
              <span className="text-gray-600">Delivery fee: {formatCurrency(deliveryFee)}</span>
            </div>
          </div>
        )}

        {minimumOrderAmount !== null && minimumOrderAmount !== undefined && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <div>
              <span className="text-gray-600">Min. order: {formatCurrency(minimumOrderAmount)}</span>
            </div>
          </div>
        )}
      </div>

      {operatingHours && (
        <div className="text-sm text-gray-600">
          <h4 className="font-medium mb-1">Operating Hours</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(operatingHours).map(([day, hours]) => (
              <div key={day} className="flex justify-between">
                <span className="capitalize">{day}:</span>
                <span>{hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}