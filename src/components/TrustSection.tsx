import { Shield, Truck, Clock, Flower2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export function TrustSection() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="h-12 w-12 text-pink-500" />,
      title: "Secure Ordering",
      description: "Your payment and personal information are always protected",
    },
    {
      icon: <Truck className="h-12 w-12 text-pink-500" />,
      title: "Same Day Delivery",
      description: "Available for orders placed before 2 PM local time",
    },
    {
      icon: <Clock className="h-12 w-12 text-pink-500" />,
      title: "Fresh Guarantee",
      description: "7-day freshness guarantee on all flowers",
    },
    {
      icon: <Flower2 className="h-12 w-12 text-pink-500" />,
      title: "Local Florists",
      description: "Supporting local businesses in your community",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The BloomSpace Promise
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to delivering happiness with every flower arrangement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-b from-white to-pink-50/30 hover:to-pink-50 transition-colors duration-300"
            >
              <div className="mb-6 transform group-hover:-translate-y-1 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 