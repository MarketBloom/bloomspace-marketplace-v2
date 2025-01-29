import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  active: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  created_at: string;
}

export function ProductCatalog() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('florist_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `product-images/${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-assets')
        .getPublicUrl(filePath);

      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: [...(editingProduct.images || []), publicUrl]
        });
      }

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const saveProduct = async () => {
    try {
      if (!editingProduct?.title || !editingProduct?.price) {
        toast.error('Please fill in all required fields');
        return;
      }

      const productData = {
        ...editingProduct,
        florist_id: user?.id
      };

      const { data, error } = await supabase
        .from('products')
        .upsert(productData)
        .select()
        .single();

      if (error) throw error;

      setProducts(current =>
        current.map(p => p.id === data.id ? data : p)
      );

      setEditingProduct(null);
      toast.success('Product saved successfully');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const toggleProductStatus = async (productId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active })
        .eq('id', productId);

      if (error) throw error;

      setProducts(current =>
        current.map(p => p.id === productId ? { ...p, active } : p)
      );

      toast.success(`Product ${active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={editingProduct?.title || ''}
                  onChange={(e) => setEditingProduct(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <Input
                  type="number"
                  value={editingProduct?.price || ''}
                  onChange={(e) => setEditingProduct(prev => ({
                    ...prev,
                    price: parseFloat(e.target.value)
                  }))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => handleImageUpload(file));
                  }}
                  disabled={isUploading}
                />
              </div>

              <Button 
                onClick={saveProduct}
                disabled={!editingProduct?.title || !editingProduct?.price}
              >
                Save Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Card key={product.id} className="p-4">
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{product.title}</h3>
                <Switch
                  checked={product.active}
                  onCheckedChange={(checked) => toggleProductStatus(product.id, checked)}
                />
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {product.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">${product.price.toFixed(2)}</span>
                <Button
                  variant="outline"
                  onClick={() => setEditingProduct(product)}
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 