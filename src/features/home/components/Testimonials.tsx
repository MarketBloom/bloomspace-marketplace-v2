import { Star } from "lucide-react";

export const Testimonials = () => {
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
      text: "I've been using this service for all my special occasions. The quality and creativity of the arrangements never disappoint.",
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

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold mb-3 tracking-tight text-foreground">What Our Customers Say</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Real reviews from happy customers who found their perfect florists through our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-[#F5F5F7] p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-base text-foreground/90 mb-6 leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center space-x-3">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};