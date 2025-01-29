import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Happy Customer",
    image: "/lovable-uploads/17a727e6-79a4-4a37-881d-6132a46827ee.png",
    text: "The flowers were absolutely stunning and arrived right on time. The local florist really understood what I was looking for!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Regular Client",
    image: "/lovable-uploads/2e9cbcc7-b4e1-4fdb-bb65-b58f0afd8976.png",
    text: "I've been using this service for all my special occasions. The quality and creativity never disappoint.",
    rating: 5
  },
  {
    name: "Emily Davis",
    role: "Event Planner",
    image: "/lovable-uploads/3a13efed-e228-490b-b760-f9ff83ae9659.png",
    text: "As an event planner, I need reliable florists. This platform connects me with the best local talent every time.",
    rating: 5
  }
];

export const MobileTestimonials = () => {
  return (
    <section className="py-8 bg-white md:hidden">
      <div className="container px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2 tracking-tight text-foreground">What Our Customers Say</h2>
          <p className="text-base text-muted-foreground">
            Real reviews from happy customers
          </p>
        </div>

        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-[#F5F5F7] p-4 rounded-xl">
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground/90 mb-4">"{testimonial.text}"</p>
              <div className="flex items-center space-x-3">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};