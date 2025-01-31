import { Star } from 'lucide-react';

interface FloristProfile {
  id: string;
  store_name: string;
  about_text: string;
  address_details: {
    suburb?: string;
    state?: string;
  };
  logo_url?: string;
  banner_url?: string;
  delivery_settings: any;
}

interface FeaturedFloristsProps {
  florists: FloristProfile[];
}

export function FeaturedFlorists({ florists }: FeaturedFloristsProps) {
  return (
    <section className="py-20 bg-[#E8E3DD]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#4A4F41] mb-4">
            Featured Florists
          </h2>
          <p className="text-lg text-[#4A4F41]/70">
            Discover our hand-picked selection of the best local florists
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {florists.map((florist) => (
            <div 
              key={florist.id}
              className="group relative bg-[#EED2D8] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={florist.banner_url || '/images/placeholder-store.jpg'} 
                  alt={florist.store_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#4A4F41] mb-1">
                  {florist.store_name}
                </h3>
                <p className="text-sm text-[#4A4F41]/80 mb-2 line-clamp-2">
                  {florist.about_text}
                </p>
                <p className="text-sm text-[#4A4F41]/70">
                  {florist.address_details?.suburb}, {florist.address_details?.state}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 