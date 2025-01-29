import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';

interface Product {
  title: string;
  description: string;
  price: number;
  images: string[];
}

export function ProductSetupForm({ onNext, onBack }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product>({
    title: '',
    description: '',
    price: 0,
    images: []
  });

  const handleAddProduct = () => {
    setProducts([...products, currentProduct]);
    setCurrentProduct({
      title: '',
      description: '',
      price: 0,
      images: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium mb-4">Add Your Products</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You can add more products later from your dashboard
        </p>
        
        <div className="space-y-4">
          <Input
            placeholder="Product Name"
            value={currentProduct.title}
            onChange={(e) => setCurrentProduct({
              ...currentProduct,
              title: e.target.value
            })}
          />
          
          <Textarea
            placeholder="Product Description"
            value={currentProduct.description}
            onChange={(e) => setCurrentProduct({
              ...currentProduct,
              description: e.target.value
            })}
          />
          
          <Input
            type="number"
            placeholder="Price"
            value={currentProduct.price}
            onChange={(e) => setCurrentProduct({
              ...currentProduct,
              price: parseFloat(e.target.value)
            })}
          />
          
          <ImageUpload
            value={currentProduct.images}
            onChange={(urls) => setCurrentProduct({
              ...currentProduct,
              images: urls
            })}
            maxFiles={4}
          />
          
          <Button 
            type="button"
            onClick={handleAddProduct}
            disabled={!currentProduct.title || !currentProduct.price}
          >
            Add Product
          </Button>
        </div>
      </div>

      {products.length > 0 && (
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Added Products ({products.length})</h4>
          <ul className="space-y-2">
            {products.map((product, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{product.title}</span>
                <span>${product.price}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">Back</Button>
        <Button onClick={() => onNext(products)}>
          {products.length > 0 ? 'Submit for Review' : 'Skip for Now'}
        </Button>
      </div>
    </div>
  );
} 