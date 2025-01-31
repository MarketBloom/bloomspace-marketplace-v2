import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Skeleton } from './ui/skeleton';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  gradient: string;
  slug: string;
}

export function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-24 bg-white">
        <div className="w-full max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-xl shadow-lg bg-white">
                <div className="aspect-w-4 aspect-h-3">
                  <Skeleton className="w-full h-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="w-full max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Shop by Occasion
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Find the perfect arrangement for every moment, big or small.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories?.map((category) => (
            <Link
              key={category.id}
              to={`/search?category=${category.slug}`}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
            >
              <div className="aspect-w-4 aspect-h-3">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} mix-blend-soft-light opacity-90 group-hover:opacity-95 transition-opacity duration-300`} />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                      {category.name}
                    </h3>
                    <p className="text-white/90 text-sm transform opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 