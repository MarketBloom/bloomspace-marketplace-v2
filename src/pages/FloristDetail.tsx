import { useParams } from "react-router-dom";
import { MapPin, Clock, DollarSign, Truck, ExternalLink } from "lucide-react";
import { useFloristProfile } from "@/hooks/useFloristProfile";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatAddressLine } from "@/utils/format";

export default function FloristDetail() {
  const { id } = useParams<{ id: string }>();
  const { floristProfile, isLoading, error } = useFloristProfile(id);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">Failed to load florist details. Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !floristProfile) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-64 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  const address = {
    streetNumber: floristProfile.street_number,
    streetName: floristProfile.street_name,
    unitNumber: floristProfile.unit_number || undefined,
    suburb: floristProfile.suburb,
    state: floristProfile.state,
    postcode: floristProfile.postcode
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner Image */}
      <div className="relative h-64 w-full mb-8 rounded-lg overflow-hidden bg-gray-100">
        {floristProfile.banner_url ? (
          <img
            src={floristProfile.banner_url}
            alt={`${floristProfile.store_name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">No banner image</span>
          </div>
        )}
      </div>

      {/* Store Info */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{floristProfile.store_name}</h1>
            <div className="mt-2 flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{formatAddressLine(address)}</span>
            </div>
          </div>

          {/* Store Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Delivery Info */}
            <div className="flex items-start space-x-2">
              <Truck className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h3 className="font-semibold">Delivery</h3>
                <p className="text-sm text-gray-600">
                  {floristProfile.delivery_radius
                    ? `Up to ${floristProfile.delivery_radius}km`
                    : "Delivery zone not specified"}
                </p>
                {floristProfile.delivery_fee !== null && (
                  <p className="text-sm text-gray-600">
                    Fee: {formatCurrency(floristProfile.delivery_fee)}
                  </p>
                )}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start space-x-2">
              <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h3 className="font-semibold">Hours</h3>
                <p className="text-sm text-gray-600">
                  {Object.entries(floristProfile.operating_hours || {}).map(([day, hours]) => (
                    <div key={day}>
                      {day}: {hours.open} - {hours.close}
                    </div>
                  ))}
                </p>
              </div>
            </div>

            {/* Minimum Order */}
            <div className="flex items-start space-x-2">
              <DollarSign className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h3 className="font-semibold">Minimum Order</h3>
                <p className="text-sm text-gray-600">
                  {floristProfile.minimum_order_amount
                    ? formatCurrency(floristProfile.minimum_order_amount)
                    : "No minimum"}
                </p>
              </div>
            </div>
          </div>

          {/* About */}
          {floristProfile.about_text && (
            <div>
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-gray-600">{floristProfile.about_text}</p>
            </div>
          )}

          {/* Products */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            <ProductGrid floristId={floristProfile.id} />
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="w-full md:w-64 space-y-4">
          {floristProfile.website_url && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(floristProfile.website_url, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </Button>
          )}

          {/* Social Links */}
          {floristProfile.social_links && Object.entries(floristProfile.social_links).length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Follow Us</h3>
              <div className="space-y-2">
                {Object.entries(floristProfile.social_links).map(([platform, url]) => (
                  <Button
                    key={platform}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => window.open(url, "_blank")}
                  >
                    <span className="capitalize">{platform}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
