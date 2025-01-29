import { cn } from "@/lib/utils";

interface ProductImagesProps {
  images: string[];
  title: string;
}

export const ProductImages = ({ images, title }: ProductImagesProps) => {
  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-lg border">
        <img
          src={images?.[0] || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images?.slice(1).map((image, index) => (
          <div key={index} className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={image}
              alt={`${title} ${index + 2}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};