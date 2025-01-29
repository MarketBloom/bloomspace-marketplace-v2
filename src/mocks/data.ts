export const mockProducts = [
  {
    id: "1",
    title: "Spring Bouquet",
    description: "A beautiful arrangement of spring flowers",
    price: 79.99,
    sale_price: null,
    images: ["/images/categories/spring-bouquet.jpg"],
    stock_status: "in_stock",
    rating: 4.5,
    total_reviews: 12,
    florist: {
      id: "1",
      store_name: "Blooming Beautiful"
    }
  },
  {
    id: "2",
    title: "White Lily Wedding Bouquet",
    description: "Elegant white lilies perfect for weddings",
    price: 149.99,
    sale_price: 129.99,
    images: ["/images/categories/white-lilies.jpg"],
    stock_status: "in_stock",
    rating: 5,
    total_reviews: 8,
    florist: {
      id: "2",
      store_name: "Wedding Florals"
    }
  },
  {
    id: "3",
    title: "Sunflower Arrangement",
    description: "Bright and cheerful sunflower arrangement",
    price: 89.99,
    sale_price: null,
    images: ["/images/categories/sunflowers.jpg"],
    stock_status: "in_stock",
    rating: 4.8,
    total_reviews: 15,
    florist: {
      id: "3",
      store_name: "Sunshine Florist"
    }
  }
];

export const mockFlorists = [
  {
    id: "1",
    user_id: "user1",
    store_name: "Blooming Beautiful",
    store_status: "active",
    about_text: "We create beautiful arrangements for all occasions",
    contact_email: "bloom@example.com",
    contact_phone: "+1234567890",
    address_details: {
      street: "123 Flower St",
      city: "New York",
      state: "NY",
      postal_code: "10001",
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    delivery_settings: {
      radius_km: 10,
      minimum_order: 50,
      same_day_cutoff: "14:00"
    }
  },
  {
    id: "2",
    user_id: "user2",
    store_name: "Wedding Florals",
    store_status: "active",
    about_text: "Specializing in wedding flowers and arrangements",
    contact_email: "weddings@example.com",
    contact_phone: "+1234567891",
    address_details: {
      street: "456 Bridal Way",
      city: "New York",
      state: "NY",
      postal_code: "10002",
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    delivery_settings: {
      radius_km: 15,
      minimum_order: 100,
      same_day_cutoff: "12:00"
    }
  }
]; 