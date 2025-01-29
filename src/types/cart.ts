import { Product } from './schema';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  florist: {
    id: string;
    name: string;
  };
}

export interface CartState {
  items: CartItem[];
  floristId: string | null;
  lastUpdated: string;
}
