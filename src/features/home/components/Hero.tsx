import { HomeFilterBar } from "@/components/HomeFilterBar";
import { MobileHero } from "@/components/MobileHero";

export const Hero = () => {
  return (
    <>
      <MobileHero />
      <section className="relative h-[calc(100vh-80px)] min-h-[600px] hidden md:flex items-center justify-center bg-[#FFFFFF]">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero/carnations-hero.jpg"
            alt="Beautiful pink and coral carnations with dramatic natural light and shadows"
            className="h-full w-full object-cover"
            style={{ 
              objectPosition: '50% 30%',
              objectFit: 'cover',
              filter: 'brightness(0.85)',
            }}
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        
        <div className="container relative z-10 px-8 flex flex-col items-center">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-7xl font-bold text-white mb-4">
              All in One Place
            </h1>
            <p className="mt-4 text-xl text-white/90">
              Support local florists and discover beautiful arrangements for every occasion
            </p>
          </div>

          <div className="w-full max-w-3xl mt-8">
            <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-lg">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <HomeFilterBar />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Delivery/Pickup Date</label>
                  <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200" placeholder="Any Date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Budget $500+</label>
                  <div className="w-full h-10 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <button className="px-6 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                  Search Delivery
                </button>
                <button className="px-6 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                  Search Pickup
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};