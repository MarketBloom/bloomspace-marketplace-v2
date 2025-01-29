import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AddProductForm } from "./AddProductForm";
import { ProductList } from "./ProductList";
import { BulkProductOperations } from "./product-form/BulkProductOperations";
import { BulkEditProducts } from "./product-form/BulkEditProducts";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Upload, Edit, Filter, SlidersHorizontal } from "lucide-react";
import { Product, ProductStatus, transformProduct } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductManagementProps {
  floristId: string;
}

export const ProductManagement = ({ floristId }: ProductManagementProps) => {
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus>("published");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price_asc" | "price_desc">("newest");

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["floristProducts", floristId, selectedStatus],
    queryFn: async () => {
      const query = supabase
        .from("products")
        .select(`
          *,
          product_sizes (
            id,
            name,
            price_adjustment,
            images,
            is_default,
            stock_quantity
          )
        `)
        .eq("florist_id", floristId)
        .eq("status", selectedStatus);

      // Apply category filter if selected
      if (selectedCategory) {
        query.eq("category", selectedCategory);
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query.order("created_at", { ascending: true });
          break;
        case "price_asc":
          query.order("price", { ascending: true });
          break;
        case "price_desc":
          query.order("price", { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((product: any) => transformProduct(product, product.product_sizes));
    },
  });

  // Get product statistics
  const { data: stats } = useQuery({
    queryKey: ["productStats", floristId],
    queryFn: async () => {
      const { data: statsData, error } = await supabase
        .from("products")
        .select("status, stock_status")
        .eq("florist_id", floristId);

      if (error) throw error;

      return {
        total: statsData.length,
        published: statsData.filter(p => p.status === "published").length,
        draft: statsData.filter(p => p.status === "draft").length,
        archived: statsData.filter(p => p.status === "archived").length,
        outOfStock: statsData.filter(p => p.stock_status === "out_of_stock").length,
        lowStock: statsData.filter(p => p.stock_status === "low_stock").length,
      };
    },
  });

  const filteredProducts = products?.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Product Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Products</p>
            {stats ? (
              <>
                <p className="text-2xl font-bold">{stats.total}</p>
                <div className="flex gap-2">
                  <Badge variant="secondary">{stats.published} Published</Badge>
                  <Badge variant="outline">{stats.draft} Draft</Badge>
                  <Badge variant="outline">{stats.archived} Archived</Badge>
                </div>
              </>
            ) : (
              <Skeleton className="h-8 w-24" />
            )}
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Stock Status</p>
            {stats ? (
              <>
                <p className="text-2xl font-bold">{stats.outOfStock + stats.lowStock}</p>
                <div className="flex gap-2">
                  <Badge variant="destructive">{stats.outOfStock} Out of Stock</Badge>
                  <Badge variant="warning">{stats.lowStock} Low Stock</Badge>
                </div>
              </>
            ) : (
              <Skeleton className="h-8 w-24" />
            )}
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as ProductStatus)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="bouquets">Bouquets</SelectItem>
                  <SelectItem value="arrangements">Arrangements</SelectItem>
                  <SelectItem value="plants">Plants</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as typeof sortBy)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product List or Loading State */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <ProductList
              products={filteredProducts}
              onProductDeleted={refetch}
            />
          )}

          {/* Add Product Button */}
          <Accordion type="single" collapsible>
            <AccordionItem value="add-product">
              <AccordionTrigger className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <span>Add New Product</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  <AddProductForm floristId={floristId} onProductAdded={refetch} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <div className="grid gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Bulk Import</h3>
              <BulkProductOperations
                floristId={floristId}
                onProductsUploaded={refetch}
                products={products || []}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Bulk Edit</h3>
              <BulkEditProducts
                products={products || []}
                onProductsUpdated={refetch}
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};