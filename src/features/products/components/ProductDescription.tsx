interface ProductDescriptionProps {
  description: string;
}

export const ProductDescription = ({ description }: ProductDescriptionProps) => {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold">Description</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};