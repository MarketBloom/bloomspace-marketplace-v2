import { StarIcon } from "@heroicons/react/24/solid";

const testimonials = [
  {
    quote: "The flowers were absolutely stunning and arrived right on time. The local florist really understood what I was looking for!",
    author: "Sarah Johnson",
    role: "Happy Customer",
    avatar: "/images/avatars/sarah.jpg",
  },
  {
    quote: "I've been using this service for all my special occasions. The quality and creativity of the arrangements never disappoint.",
    author: "Michael Chen",
    role: "Regular Client",
    avatar: "/images/avatars/michael.jpg",
  },
  {
    quote: "As an event planner, I need reliable florists. This platform connects me with the best local talent every time.",
    author: "Emily Davis",
    role: "Event Planner",
    avatar: "/images/avatars/emily.jpg",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 px-4 relative bg-gradient-to-b from-[#F2FCE2] to-[#FDE1D3]">
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
      
      <div className="max-w-screen-2xl mx-auto relative z-0">
        <h2 className="text-4xl font-semibold text-center mb-2 tracking-normal leading-tight">
          What Our Customers Say
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 leading-relaxed max-w-3xl mx-auto">
          Real reviews from happy customers who found their perfect florists through our platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="group bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-black/5 hover:border-black/10 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex gap-1 mb-4 transition-transform duration-300 group-hover:scale-110">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className="h-5 w-5 text-[#D73459]"
                  />
                ))}
              </div>
              
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D73459] via-[#eed2d8] to-[#D73459] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="h-10 w-10 rounded-full object-cover relative z-10 ring-2 ring-white"
                  />
                </div>
                <div>
                  <div className="font-medium tracking-wide text-[#1D1D1F]">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
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