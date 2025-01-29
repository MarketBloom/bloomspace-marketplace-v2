import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Product, ProductStatus } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

export interface BulkEditProductsProps {
  products: Product[];
  onProductsUpdated: (options?: RefetchOptions) => Promise<QueryObserverResult<any[], Error>>;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface BulkEditFields {
  price?: number;
  salePrice?: number;
  category?: string;
  status?: ProductStatus;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

export const BulkEditProducts = ({ 
  products, 
  onProductsUpdated, 
  onClose, 
  onSuccess 
}: BulkEditProductsProps) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkFields, setBulkFields] = useState<BulkEditFields>({});
  const [selectedFields, setSelectedFields] = useState<(keyof BulkEditFields)[]>([]);

  const columns: ColumnDef<Product>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <span>${row.getValue("price")}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "stock_quantity",
      header: "Stock",
    }
  ];

  const handleFieldToggle = (field: keyof BulkEditFields) => {
    setSelectedFields(prev => 
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleFieldChange = (field: keyof BulkEditFields, value: any) => {
    setBulkFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProducts.length === 0 || selectedFields.length === 0) {
      toast.error("Please select products and fields to update");
      return;
    }

    setIsSubmitting(true);
    try {
      const updates = Object.fromEntries(
        selectedFields.map(field => [field, bulkFields[field]])
      );

      const { error } = await supabase
        .from("products")
        .update(updates)
        .in("id", selectedProducts);

      if (error) throw error;

      await onProductsUpdated();
      toast.success("Products updated successfully");
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Error updating products:", error);
      toast.error(error.message || "Failed to update products");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fields to Update</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="price"
                checked={selectedFields.includes("price")}
                onCheckedChange={() => handleFieldToggle("price")}
              />
              <Label htmlFor="price">Price</Label>
            </div>
            {selectedFields.includes("price") && (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={bulkFields.price || ""}
                onChange={(e) => handleFieldChange("price", parseFloat(e.target.value))}
                placeholder="New price"
              />
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="salePrice"
                checked={selectedFields.includes("salePrice")}
                onCheckedChange={() => handleFieldToggle("salePrice")}
              />
              <Label htmlFor="salePrice">Sale Price</Label>
            </div>
            {selectedFields.includes("salePrice") && (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={bulkFields.salePrice || ""}
                onChange={(e) => handleFieldChange("salePrice", parseFloat(e.target.value))}
                placeholder="New sale price"
              />
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="category"
                checked={selectedFields.includes("category")}
                onCheckedChange={() => handleFieldToggle("category")}
              />
              <Label htmlFor="category">Category</Label>
            </div>
            {selectedFields.includes("category") && (
              <Select
                value={bulkFields.category}
                onValueChange={(value) => handleFieldChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Bouquets",
                    "Arrangements",
                    "Roses",
                    "Lilies",
                    "Sunflowers",
                    "Mixed Flowers",
                    "Plants",
                    "Seasonal"
                  ].map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="status"
                checked={selectedFields.includes("status")}
                onCheckedChange={() => handleFieldToggle("status")}
              />
              <Label htmlFor="status">Status</Label>
            </div>
            {selectedFields.includes("status") && (
              <Select
                value={bulkFields.status}
                onValueChange={(value) => handleFieldChange("status", value as ProductStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="stockQuantity"
                checked={selectedFields.includes("stockQuantity")}
                onCheckedChange={() => handleFieldToggle("stockQuantity")}
              />
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
            </div>
            {selectedFields.includes("stockQuantity") && (
              <Input
                type="number"
                min="0"
                value={bulkFields.stockQuantity || ""}
                onChange={(e) => handleFieldChange("stockQuantity", parseInt(e.target.value))}
                placeholder="New stock quantity"
              />
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowStockThreshold"
                checked={selectedFields.includes("lowStockThreshold")}
                onCheckedChange={() => handleFieldToggle("lowStockThreshold")}
              />
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
            </div>
            {selectedFields.includes("lowStockThreshold") && (
              <Input
                type="number"
                min="0"
                value={bulkFields.lowStockThreshold || ""}
                onChange={(e) => handleFieldChange("lowStockThreshold", parseInt(e.target.value))}
                placeholder="New low stock threshold"
              />
            )}
          </div>
        </div>

        <div>
          <Label>Selected Products ({selectedProducts.length})</Label>
          <div className="mt-2 border rounded-lg">
            <DataTable
              columns={columns}
              data={products}
              onSelectionChange={setSelectedProducts}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || selectedProducts.length === 0 || selectedFields.length === 0}
        >
          {isSubmitting ? "Updating..." : "Update Selected Products"}
        </Button>
      </div>
    </div>
  );
};