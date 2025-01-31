import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Johnson",
    image: "/images/testimonials/testimonial-1.jpg",
    role: "Happy Customer",
    content: "The flowers were absolutely stunning and arrived right on time. The florist even called to confirm the delivery details. Exceptional service!",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    image: "/images/testimonials/testimonial-2.jpg",
    role: "Regular Customer",
    content: "I've been using BloomSpace for all my flower deliveries. The quality is consistently excellent, and the local florists are true artists.",
    rating: 5
  },
  {
    id: 3,
    name: "Emma Wilson",
    image: "/images/testimonials/testimonial-3.jpg",
    role: "Event Planner",
    content: "As an event planner, I need reliable florists. BloomSpace has never disappointed. Their network of local florists is outstanding.",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section className="py-20 bg-[#E8E3DD]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#4A4F41] mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-[#4A4F41]/70 max-w-2xl mx-auto">
            Read about experiences from our happy customers across Australia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-[#EED2D8] rounded-xl p-8"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star 
                    key={i}
                    className="w-5 h-5 fill-[#4A4F41] text-[#4A4F41]"
                  />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-[#4A4F41]/80 mb-6">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-[#4A4F41]">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-[#4A4F41]/70">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 