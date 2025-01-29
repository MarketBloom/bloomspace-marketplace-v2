import { HomeFilterBar } from "@/components/HomeFilterBar";

export function MobileHero() {
  return (
    <section className="relative h-[calc(100vh-64px)] min-h-[500px] md:hidden flex items-center justify-center bg-[#FFFFFF]">
      <div className="absolute inset-0">
        <img
          src="/images/hero/carnations-hero.jpg"
          alt="Beautiful fresh carnations in natural light"
          className="w-full h-full object-cover object-center brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>
      
      <div className="relative z-10 w-full px-4">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-3">
            All in One Place
          </h1>
          <p className="text-lg text-white/90 max-w-sm mx-auto">
            Find and order beautiful flowers from local florists for any occasion
          </p>
        </div>
        
        <HomeFilterBar />
      </div>
    </section>
  );
} 