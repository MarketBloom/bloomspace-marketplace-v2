import { FlowerIcon, HeartIcon, FilterIcon, TruckIcon } from "lucide-react";

const features = [
  {
    title: "Local Excellence",
    description: "Support the finest florists in your community creating stunning arrangements",
    icon: FlowerIcon,
  },
  {
    title: "Seamless Selection",
    description: "Browse and filter arrangements from our florists, and complete your order in one place",
    icon: HeartIcon,
  },
  {
    title: "Secure Checkout",
    description: "Shop with confidence using our safe and effortless payment system",
    icon: FilterIcon,
  },
  {
    title: "Doorstep Delivery",
    description: "Your beautiful arrangement delivered right to your door, same day available",
    icon: TruckIcon,
  },
];

export function Features() {
  return (
    <section className="py-16 px-4 relative bg-gradient-to-b from-white to-[#F2FCE2]">
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
      
      <div className="max-w-screen-2xl mx-auto relative z-0">
        <h2 className="text-4xl md:text-5xl font-semibold text-center mb-4 tracking-tight leading-tight">
          Fresh Flowers, Delivered with Care
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 leading-relaxed max-w-3xl mx-auto">
          Discover our handpicked selection of exceptional local florists, all in one convenient place
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white/80 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-black/5 hover:border-black/10 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="bg-gradient-to-r from-[#D73459] via-[#eed2d8] to-[#D73459] rounded-lg p-4 w-fit transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-xl font-medium tracking-wide text-[#1D1D1F] leading-snug">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 