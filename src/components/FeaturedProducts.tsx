import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Skeleton } from "./ui/skeleton";

interface FloristProfile {
  id: string;
  store_name: string;
  address_details: {
    suburb: string;
    state: string;
  };
  delivery_settings: {
    max_distance_km: number;
    delivery_fee: number;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  images: string[];
  florist_profiles: FloristProfile;
}

interface FeaturedProductsProps {
  products: Product[];
  isLoading: boolean;
}

export function FeaturedProducts({ products, isLoading }: FeaturedProductsProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-AU', {
      style: 'currency',
      currency: 'AUD',
    });
  };

  if (isLoading) {
    return (
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <Skeleton className="w-full aspect-w-4 aspect-h-3" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Arrangements</h2>
          <p className="text-lg text-gray-600">
            Handcrafted by our curated selection of Australia's premium local florists
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative aspect-w-4 aspect-h-3">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <button className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-200">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                  <div className="text-right">
                    {product.sale_price ? (
                      <>
                        <span className="text-lg font-bold text-rose-600">{formatPrice(product.sale_price)}</span>
                        <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.price)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {product.florist_profiles.store_name}
                    </span>
                  </div>
                  <p className="text-sm text-rose-600">
                    Delivers to {product.florist_profiles.address_details.suburb} and surrounding areas
                    {product.florist_profiles.delivery_settings.delivery_fee > 0 && 
                      ` · ${formatPrice(product.florist_profiles.delivery_settings.delivery_fee)} delivery`}
                  </p>
                  <Button
                    className="w-full px-4 py-2 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 transition-colors duration-200"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/search"
            className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium"
          >
            View All Arrangements
            <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
} 