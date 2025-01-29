import { useIsMobile } from "@/hooks/use-mobile";

interface ProductInfoProps {
  title: string;
  price: number;
  floristName?: string;
  displaySize?: string | null;
}

export const ProductInfo = ({ title, price, floristName, displaySize }: ProductInfoProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-0.5">
        <h3 className="text-[11px] md:text-[15px] font-semibold leading-tight text-foreground line-clamp-1 break-words">
          {title}
        </h3>
        {floristName && (
          <p className="text-[10px] md:text-[12px] text-muted-foreground font-normal line-clamp-1">
            {floristName}
          </p>
        )}
        <div className="flex justify-between items-center">
          <p className="text-[10px] md:text-[12px] text-foreground line-clamp-1 max-w-[60%]">
            {displaySize || "Standard"}
          </p>
          <p className="text-[10px] md:text-[12px] font-medium text-foreground whitespace-nowrap pl-1">
            ${price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};