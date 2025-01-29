import { Link } from "react-router-dom";

const categories = [
  {
    title: "Birthday",
    image: "/images/categories/birthday.jpg",
    href: "/category/birthday",
  },
  {
    title: "Romance",
    image: "/images/categories/romance.jpg",
    href: "/category/romance",
  },
  {
    title: "Premium",
    image: "/images/categories/premium.jpg",
    href: "/category/premium",
  },
  {
    title: "Seasonal",
    image: "/images/categories/seasonal.jpg",
    href: "/category/seasonal",
  },
];

export function Categories() {
  return (
    <section className="py-16 px-4 relative">
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
      
      <div className="max-w-screen-2xl mx-auto relative z-0">
        <h2 className="text-4xl font-semibold mb-2 tracking-normal leading-tight">
          Shop by Category
        </h2>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Explore our curated collection of floral categories
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category.title}
              to={category.href}
              className="group relative aspect-square overflow-hidden rounded-lg border border-black/5 hover:border-black/10 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-90 transition-opacity duration-300 bg-gradient-to-r from-[#D73459] via-[#eed2d8] to-[#D73459]" style={{ mixBlendMode: 'overlay' }} />
              <div className="absolute bottom-4 left-4 z-10">
                <h3 className="text-2xl font-medium tracking-wide text-white">
                  {category.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 