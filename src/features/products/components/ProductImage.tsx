import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export const ProductImage = ({ src, alt, className }: ProductImageProps) => {
  return (
    <div className={cn("h-full w-full overflow-hidden bg-secondary", className)}>
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
    </div>
  );
};