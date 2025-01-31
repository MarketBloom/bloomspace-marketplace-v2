import { Award, Clock, Shield, Truck } from "lucide-react";

const features = [
  {
    title: "Quality Guaranteed",
    description: "Every arrangement is crafted with fresh, premium flowers",
    icon: Award,
  },
  {
    title: "Same Day Delivery",
    description: "Order by 2 PM for delivery today in most areas",
    icon: Clock,
  },
  {
    title: "Secure Payments",
    description: "Your transactions are protected with bank-level security",
    icon: Shield,
  },
  {
    title: "Free Shipping",
    description: "Complimentary delivery on orders over $75",
    icon: Truck,
  },
];

export function TrustSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-bloom-olive-light/5 to-white" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-bloom-sunset-yellow rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-bloom-olive-light rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float animation-delay-2000" />
      </div>

      <div className="relative w-full max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-bloom-text-primary mb-4 tracking-tight">
            Why Choose Us
          </h2>
          <p className="text-lg text-bloom-text-secondary leading-relaxed">
            We're committed to providing the best floral experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Icon with Gradient Background */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-bloom-sunset-yellow via-bloom-sunset-orange to-bloom-sunset-purple p-[1px] transform group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-bloom-sunset-orange" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-bloom-sunset-yellow via-bloom-sunset-orange to-bloom-sunset-purple opacity-50 blur-xl -z-10 group-hover:opacity-70 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-bloom-text-primary mb-3 group-hover:text-bloom-sunset-orange transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-bloom-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8">
          <div className="flex items-center space-x-2 text-bloom-text-secondary">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            <span>Fast Delivery</span>
          </div>
          <div className="h-4 w-px bg-bloom-text-secondary/20" />
          <div className="flex items-center space-x-2 text-bloom-text-secondary">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure Payments</span>
          </div>
          <div className="h-4 w-px bg-bloom-text-secondary/20" />
          <div className="flex items-center space-x-2 text-bloom-text-secondary">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Quality Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
} 