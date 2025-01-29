import axios from 'axios';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create an axios instance with Supabase configuration
export const apiClient = axios.create({
  baseURL: supabaseUrl,
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  }
});

// API wrapper functions
export const api = {
  // Auth functions
  auth: {
    signUp: async (email: string, password: string) => {
      const response = await apiClient.post('/auth/v1/signup', {
        email,
        password
      });
      return response.data;
    },
    signIn: async (email: string, password: string) => {
      const response = await apiClient.post('/auth/v1/token?grant_type=password', {
        email,
        password
      });
      return response.data;
    },
    signOut: async () => {
      const response = await apiClient.post('/auth/v1/logout');
      return response.data;
    }
  },

  // Database functions
  db: {
    // Florists
    getFlorists: async () => {
      const response = await apiClient.get('/rest/v1/florist_profiles?select=*');
      return response.data;
    },
    
    // Products
    getProducts: async () => {
      const response = await apiClient.get('/rest/v1/products?select=*');
      return response.data;
    },
    
    // Orders
    getOrders: async () => {
      const response = await apiClient.get('/rest/v1/orders?select=*');
      return response.data;
    },
    
    // Reviews
    getReviews: async () => {
      const response = await apiClient.get('/rest/v1/reviews?select=*');
      return response.data;
    }
  },

  // Storage functions
  storage: {
    upload: async (bucket: string, path: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post(`/storage/v1/object/${bucket}/${path}`, formData);
      return response.data;
    }
  }
}; 