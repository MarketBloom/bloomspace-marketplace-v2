import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProductImagesProps {
  images: string[];
  alt: string;
}

export function ProductImages({ images, alt }: ProductImagesProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col-reverse">
      {/* Main Image */}
      <div className="aspect-w-1 aspect-h-1 w-full">
        <div className="relative h-full">
          <img
            src={images[currentImage]}
            alt={`${alt} - Image ${currentImage + 1}`}
            className="h-full w-full object-cover object-center rounded-lg"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={previousImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Fullscreen Button */}
          <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <Expand className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl h-[90vh]">
              <div className="relative h-full">
                <img
                  src={images[currentImage]}
                  alt={`${alt} - Image ${currentImage + 1}`}
                  className="h-full w-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={previousImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
          <div className="grid grid-cols-4 gap-6">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none focus:ring focus:ring-primary focus:ring-offset-4 ${
                  index === currentImage ? "ring-2 ring-primary" : ""
                }`}
              >
                <span className="sr-only">View Image {index + 1}</span>
                <span className="absolute inset-0 overflow-hidden rounded-md">
                  <img
                    src={image}
                    alt={`${alt} - Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover object-center"
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 