import { Flower, Heart, Filter, Truck } from 'lucide-react';

const FEATURES = [
  {
    icon: Flower,
    title: "Local Excellence",
    description: "Support the finest florists in your community creating stunning arrangements"
  },
  {
    icon: Heart,
    title: "Seamless Selection",
    description: "Browse and filter arrangements from our florists, and complete your order in one place"
  },
  {
    icon: Filter,
    title: "Secure Checkout",
    description: "Shop with confidence using our safe and effortless payment system"
  },
  {
    icon: Truck,
    title: "Doorstep Delivery",
    description: "Your beautiful arrangement delivered right to your door, same day available"
  }
];

export function HowItWorks() {
  return (
    <section className="hidden md:block py-24 bg-[#E8E3DD]">
      <div className="container mx-auto px-4 max-w-[1400px]">
        {/* Typography */}
        <h2 className="text-7xl font-bold text-center mb-4 tracking-tight text-[#4A4F41]">
          Fresh Flowers, Delivered with Care
        </h2>
        <p className="text-xl text-[#4A4F41]/70 text-center max-w-[800px] mx-auto mb-16">
          Discover our handpicked selection of exceptional local florists, all in one convenient place
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => (
            <div 
              key={index}
              className="bg-[#EED2D8] rounded-2xl p-8 flex flex-col justify-between min-h-[360px]"
            >
              {/* Top Content */}
              <div>
                <h3 className="text-xl font-semibold mb-3 text-[#4A4F41]">
                  {feature.title}
                </h3>
                <p className="text-[#4A4F41]/80">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Card */}
              <div className="bg-white rounded-xl p-6 mt-4">
                <div className="h-1.5 bg-[#4A4F41]/10 rounded-full w-3/4 mb-2" />
                <div className="h-1.5 bg-[#4A4F41]/10 rounded-full w-1/2" />
                <feature.icon className="w-6 h-6 text-[#4A4F41] mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 