interface ProductPriceProps {
  price: number;
}

export const ProductPrice = ({ price }: ProductPriceProps) => {
  return (
    <div>
      <p className="text-2xl font-semibold text-primary">
        ${price.toFixed(2)}
      </p>
    </div>
  );
};