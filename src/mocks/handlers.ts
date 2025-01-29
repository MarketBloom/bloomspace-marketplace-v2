import { http, HttpResponse } from 'msw';
import { mockProducts, mockFlorists } from './data';

const baseUrl = 'https://senfrikghcfchjjlosxx.supabase.co/rest/v1';

// Helper function to create a colored SVG placeholder
const createPlaceholderSVG = (text: string, bgColor = '#f8e7ed', textColor = '#e11d48') => {
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="${bgColor}"/>
      <text x="50%" y="50%" font-size="24" text-anchor="middle" alignment-baseline="middle" font-family="system-ui, sans-serif" fill="${textColor}">
        ${text}
      </text>
    </svg>
  `;
  return new HttpResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
};

export const handlers = [
  // Get featured products
  http.get(`${baseUrl}/products`, ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const isHidden = url.searchParams.get('is_hidden');
    
    if (limit && isHidden === 'false') {
      return HttpResponse.json(mockProducts.slice(0, parseInt(limit)));
    }

    // Filter products based on query parameters
    const status = url.searchParams.get('status');
    const stockStatus = url.searchParams.get('stock_status');
    
    let filteredProducts = mockProducts;
    
    if (status) {
      filteredProducts = filteredProducts.filter(p => p.status === status);
    }
    if (stockStatus) {
      filteredProducts = filteredProducts.filter(p => p.stock_status === stockStatus);
    }

    return HttpResponse.json(filteredProducts);
  }),

  // Get florist profiles
  http.get(`${baseUrl}/florist_profiles`, ({ request }) => {
    const url = new URL(request.url);
    const storeStatus = url.searchParams.get('store_status');
    
    let filteredFlorists = mockFlorists;
    
    if (storeStatus) {
      filteredFlorists = filteredFlorists.filter(f => f.store_status === storeStatus);
    }

    return HttpResponse.json(filteredFlorists);
  }),

  // Mock category images
  http.get('/images/categories/bouquets.jpg', () => {
    return createPlaceholderSVG('Beautiful Bouquets');
  }),
  http.get('/images/categories/arrangements.jpg', () => {
    return createPlaceholderSVG('Floral Arrangements');
  }),
  http.get('/images/categories/wedding.jpg', () => {
    return createPlaceholderSVG('Wedding Flowers');
  }),
  http.get('/images/categories/plants.jpg', () => {
    return createPlaceholderSVG('Indoor & Outdoor Plants');
  }),

  // Mock product images
  http.get('/images/products/:id', ({ params }) => {
    return createPlaceholderSVG(`Product ${params.id}`);
  }),

  // Mock placeholder image
  http.get('/images/placeholder.jpg', () => {
    return createPlaceholderSVG('Image Not Available');
  }),

  // Supabase API mocks
  http.get('*/rest/v1/products*', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Spring Bouquet',
        price: 79.99,
        images: ['/images/products/spring-bouquet.jpg'],
        florist: {
          id: 'f1',
          store_name: 'Blooming Beautiful'
        }
      },
      {
        id: '2',
        title: 'White Lily Wedding Bouquet',
        price: 129.99,
        images: ['/images/products/white-lily.jpg'],
        florist: {
          id: 'f2',
          store_name: 'Wedding Florals'
        }
      },
      {
        id: '3',
        title: 'Sunflower Arrangement',
        price: 89.99,
        images: ['/images/products/sunflower.jpg'],
        florist: {
          id: 'f3',
          store_name: 'Sunshine Petals'
        }
      }
    ]);
  })
]; 