import { Json } from './database';

export type ProductStatus = 'draft' | 'published' | 'archived';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Size {
  id: string;
  name: string;
  price: string;
  images?: string[];
  isDefault?: boolean;
  stockQuantity?: number;
}

export interface ProductSize {
  id: string;
  product_id: string;
  name: string;
  price_adjustment: number;
  images: string[];
  is_default: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  florist_id: string;
  title: string;
  description: string;
  price: number;
  sale_price?: number;
  images: string[];
  category?: string;
  occasion: string[];
  tags: string[];
  status: ProductStatus;
  stock_status: StockStatus;
  stock_quantity: number;
  low_stock_threshold: number;
  metadata: Record<string, any>;
  product_sizes?: ProductSize[];
  created_at: string;
  updated_at: string;
}

export interface ProductAnalytics {
  total_views: number;
  total_orders: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
  daily_views: Array<{
    date: string;
    views: number;
  }>;
  daily_orders: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  stock_history: Array<{
    date: string;
    quantity: number;
  }>;
  size_popularity: Array<{
    size_name: string;
    orders: number;
    revenue: number;
  }>;
}

export interface ProductVariation {
  id: string;
  product_id: string;
  size_id: string;
  color?: string;
  style?: string;
  price_adjustment: number;
  stock_quantity: number;
  sku: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  created_at: string;
  updated_at: string;
}

export interface BulkProductOperation {
  operation: "import" | "export";
  status: "pending" | "processing" | "completed" | "failed";
  total_records?: number;
  processed_records?: number;
  failed_records?: number;
  error_log?: string[];
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductSizesTable {
  Row: {
    id: string;
    product_id: string;
    name: string;
    price_adjustment: number;
    images?: string[];
    is_default?: boolean;
    stock_quantity?: number;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    product_id: string;
    name: string;
    price_adjustment: number;
    images?: string[];
    is_default?: boolean;
    stock_quantity?: number;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    product_id?: string;
    name?: string;
    price_adjustment?: number;
    images?: string[];
    is_default?: boolean;
    stock_quantity?: number;
    updated_at?: string;
  };
}

export interface ProductsTable {
  Row: {
    id: string;
    florist_id: string;
    title: string;
    description: string;
    price: number;
    sale_price?: number;
    images?: string[];
    category?: string;
    categories?: string[];
    occasion?: string[];
    tags?: string[];
    status: ProductStatus;
    stock_status: StockStatus;
    stock_quantity?: number;
    low_stock_threshold?: number;
    metadata: Json;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    florist_id: string;
    title: string;
    description: string;
    price: number;
    sale_price?: number;
    images?: string[];
    category?: string;
    categories?: string[];
    occasion?: string[];
    tags?: string[];
    status?: ProductStatus;
    stock_status?: StockStatus;
    stock_quantity?: number;
    low_stock_threshold?: number;
    metadata?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    florist_id?: string;
    title?: string;
    description?: string;
    price?: number;
    sale_price?: number;
    images?: string[];
    category?: string;
    categories?: string[];
    occasion?: string[];
    tags?: string[];
    status?: ProductStatus;
    stock_status?: StockStatus;
    stock_quantity?: number;
    low_stock_threshold?: number;
    metadata?: Record<string, any>;
    updated_at?: string;
  };
}

export const PRODUCT_CATEGORIES = [
  "Bouquets",
  "Arrangements",
  "Roses",
  "Lilies",
  "Sunflowers",
  "Mixed Flowers",
  "Plants",
  "Seasonal",
  "Wedding",
  "Events"
] as const;

export const PRODUCT_OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Sympathy",
  "Get Well",
  "Thank You",
  "New Baby",
  "Congratulations",
  "Valentine's Day",
  "Mother's Day",
  "Christmas",
  "Just Because"
] as const;

export const PRODUCT_TAGS = [
  "Best Seller",
  "New Arrival",
  "Sale",
  "Featured",
  "Limited Edition",
  "Eco-Friendly",
  "Local",
  "Imported",
  "Premium",
  "Budget-Friendly"
] as const;

export const transformProduct = (
  row: ProductsTable['Row'] | any,
  sizes?: ProductSizesTable['Row'][]
): Product => {
  const baseProduct = {
    id: row.id,
    florist_id: row.florist_id,
    title: row.title,
    description: row.description,
    price: row.price,
    sale_price: row.sale_price,
    images: row.images || [],
    category: row.category,
    occasion: row.occasion || [],
    tags: row.tags || [],
    status: row.status || "draft",
    stock_status: row.stock_status || "in_stock",
    stock_quantity: row.stock_quantity || 0,
    low_stock_threshold: row.low_stock_threshold || 5,
    metadata: row.metadata || {},
    created_at: row.created_at,
    updated_at: row.updated_at
  };

  if (sizes) {
    return {
      ...baseProduct,
      product_sizes: sizes.map(size => ({
        id: size.id,
        product_id: size.product_id,
        name: size.name,
        price_adjustment: size.price_adjustment || 0,
        images: size.images || [],
        is_default: size.is_default || false,
        stock_quantity: size.stock_quantity
      }))
    };
  }

  return baseProduct;
};