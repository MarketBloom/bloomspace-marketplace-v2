export interface ReviewsTable {
  Row: {
    id: string;
    order_id: string | null;
    customer_id: string | null;
    florist_id: string | null;
    rating: number | null;
    comment: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    order_id?: string | null;
    customer_id?: string | null;
    florist_id?: string | null;
    rating?: number | null;
    comment?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<ReviewsTable['Insert']>;
}