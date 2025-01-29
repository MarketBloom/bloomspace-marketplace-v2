import { HomeFilterBar } from "@/components/HomeFilterBar";

export const MobileHero = () => {
  return (
    <section className="relative h-[calc(100vh-80px)] flex items-center justify-center bg-[#FFFFFF] md:hidden">
      <div className="absolute inset-0">
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
      
      <div className="container relative z-10 px-4 flex flex-col items-center">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            All in One Place
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Support local florists and discover beautiful arrangements for every occasion
          </p>
        </div>

        <div className="w-full max-w-xl mt-6">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg">
            <div className="space-y-4">
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
            <div className="flex flex-col gap-3 mt-6">
              <button className="w-full py-2 bg-white rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                Search Delivery
              </button>
              <button className="w-full py-2 bg-white rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                Search Pickup
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};