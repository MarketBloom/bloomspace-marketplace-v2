import { Flower2, Gift, Heart, Star } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CategoriesProps {
  navigate: (path: string) => void;
}

const categories = [
  {
    name: "Birthday",
    icon: <Gift className="h-4 w-4" />,
    description: "Perfect for celebrations",
    image: "/lovable-uploads/639fac67-e61e-41dc-b3c1-562fe547aef1.png"
  },
  {
    name: "Romance",
    icon: <Heart className="h-4 w-4" />,
    description: "Express your love",
    image: "/lovable-uploads/683185ef-5451-4967-beef-fec3a2908a4f.png"
  },
  {
    name: "Premium",
    icon: <Star className="h-4 w-4" />,
    description: "Luxury arrangements",
    image: "/lovable-uploads/e1b1a25b-94d5-4eb5-a0d8-0a4d4a18d4a1.png"
  },
  {
    name: "Seasonal",
    icon: <Flower2 className="h-4 w-4" />,
    description: "Fresh picks",
    image: "/lovable-uploads/731739bb-c331-43ed-948f-bdfcbc18e356.png"
  }
];

export const Categories = ({ navigate }: CategoriesProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.category-card');
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { 
            opacity: 0,
            y: 50
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=100",
              end: "top center",
              toggleActions: "play none none reverse",
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-4 md:py-8 mt-4 md:mt-0">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Shop by Category</h2>
          <p className="text-base text-muted-foreground mt-1">Explore our curated collection of floral categories</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.name}
              className="category-card relative overflow-hidden cursor-pointer rounded-2xl bg-white shadow-apple hover:shadow-apple-hover transition-shadow duration-300"
              onClick={() => navigate(`/search?category=${category.name.toLowerCase()}`)}
              data-speed={1 + Math.random()}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white text-lg font-semibold">{category.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};