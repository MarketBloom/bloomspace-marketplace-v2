# Bloomspace API Documentation

## Florist Profile Management

### Get Florist Profile
```http
GET /api/florist/{floristId}
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| floristId | string | Unique identifier of the florist |

#### Response
```typescript
{
  id: string;
  name: string;
  description: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  delivery_settings: {
    max_distance: number;
    delivery_zones: string[];
    delivery_fee: number;
  };
  business_hours: {
    [day: string]: {
      open: string;
      close: string;
    };
  };
  contact: {
    phone: string;
    email: string;
  };
}
```

### Update Florist Profile
```http
PUT /api/florist/{floristId}
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| floristId | string | Unique identifier of the florist |
| profile | FloristProfile | Updated profile data |

#### Request Body
```typescript
{
  name?: string;
  description?: string;
  address?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  delivery_settings?: {
    max_distance: number;
    delivery_zones: string[];
    delivery_fee: number;
  };
  business_hours?: {
    [day: string]: {
      open: string;
      close: string;
    };
  };
  contact?: {
    phone: string;
    email: string;
  };
}
```

### Check Delivery Availability
```http
POST /api/florist/{floristId}/delivery/check
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| floristId | string | Unique identifier of the florist |
| latitude | number | Delivery location latitude |
| longitude | number | Delivery location longitude |
| deliveryDate | string | Optional. Desired delivery date (YYYY-MM-DD) |
| deliveryTime | string | Optional. Desired delivery time (HH:mm) |

#### Response
```typescript
{
  can_deliver: boolean;
  estimated_distance: number;
  estimated_duration: number;
  reason?: string;
}
```

### Get Delivery Slots
```http
GET /api/florist/{floristId}/delivery/slots
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| floristId | string | Unique identifier of the florist |
| date | string | Date to check availability (YYYY-MM-DD) |

#### Response
```typescript
{
  available_slots: {
    time: string;
    available: boolean;
    capacity: number;
  }[];
}
```

### Search Florists
```http
GET /api/florists/search
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| latitude | number | Search center latitude |
| longitude | number | Search center longitude |
| maxDistance | number | Maximum distance in kilometers |
| query | string | Optional. Search query for name/description |

#### Response
```typescript
{
  florists: {
    id: string;
    name: string;
    description: string;
    distance: number;
    rating: number;
    thumbnail: string;
  }[];
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "validation_error",
  "message": "Detailed error message",
  "details": {
    "field": ["error details"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred"
}
```
