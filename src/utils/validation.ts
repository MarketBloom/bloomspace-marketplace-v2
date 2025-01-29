import { z } from 'zod';
import type { Address, BusinessSettings, FloristProfile, Product } from '@/types/schema';

// Helper regex patterns
const TIME_PATTERN = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
const PHONE_PATTERN = /^(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}$/;
const POSTCODE_PATTERN = /^[0-9]{4}$/;
const URL_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Address validation schema
export const addressSchema = z.object({
  street_number: z.string().min(1, 'Street number is required'),
  street_name: z.string().min(1, 'Street name is required'),
  unit_number: z.string().optional(),
  suburb: z.string().min(1, 'Suburb is required'),
  state: z.string().min(1, 'State is required')
    .refine(val => ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'].includes(val.toUpperCase()), {
      message: 'Invalid state code',
    }),
  postcode: z.string()
    .regex(POSTCODE_PATTERN, 'Postcode must be 4 digits')
    .refine(val => isValidPostcode(val), {
      message: 'Invalid postcode for state',
    }),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  formatted_address: z.string().optional(),
});

// Business hours validation schema
const businessHoursSchema = z.object({
  open: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)'),
  close: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)'),
  closed: z.boolean().optional(),
}).refine(data => {
  if (data.closed) return true;
  const [openHour, openMin] = data.open.split(':').map(Number);
  const [closeHour, closeMin] = data.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  return closeTime > openTime;
}, {
  message: 'Closing time must be after opening time',
});

// Cutoff time validation schema
const cutoffTimeSchema = z.object({
  default: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)'),
  monday: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)').nullable().optional(),
  tuesday: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)').nullable().optional(),
  wednesday: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)').nullable().optional(),
  thursday: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)').nullable().optional(),
  friday: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)').nullable().optional(),
  saturday: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)').nullable().optional(),
  sunday: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)').nullable().optional(),
});

// Special event settings validation schema
const specialEventSettingsSchema = z.object({
  enabled: z.boolean(),
  cutoff_time: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)'),
  delivery_fee_multiplier: z.number().min(1, 'Multiplier must be at least 1').max(5, 'Maximum multiplier is 5'),
  minimum_order_multiplier: z.number().min(1, 'Multiplier must be at least 1').max(5, 'Maximum multiplier is 5'),
});

// Delivery slot validation schema
const deliverySlotSchema = z.object({
  name: z.string(),
  start: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)'),
  end: z.string().regex(TIME_PATTERN, 'Invalid time format (HH:MM)'),
  enabled: z.boolean(),
  max_orders: z.number().int().min(1, 'Must allow at least 1 order'),
  premium_fee: z.number().min(0, 'Premium fee cannot be negative'),
}).refine(data => {
  const [startHour, startMin] = data.start.split(':').map(Number);
  const [endHour, endMin] = data.end.split(':').map(Number);
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  return endTime > startTime;
}, {
  message: 'End time must be after start time',
});

// Delivery slots validation schema
const deliverySlotsSchema = z.object({
  weekdays: z.object({
    slots: z.array(deliverySlotSchema),
  }),
  weekends: z.object({
    slots: z.array(deliverySlotSchema),
  }),
  special_events: z.object({
    valentines_day: z.object({
      slots: z.array(deliverySlotSchema),
    }),
    mothers_day: z.object({
      slots: z.array(deliverySlotSchema),
    }),
  }),
});

// Delivery settings validation schema
const deliverySettingsSchema = z.object({
  radius_km: z.number()
    .min(0, 'Radius must be positive')
    .max(100, 'Maximum delivery radius is 100km'),
  fee: z.number()
    .min(0, 'Fee must be positive')
    .max(100, 'Maximum delivery fee is $100'),
  minimum_order: z.number()
    .min(0, 'Minimum order must be positive')
    .max(1000, 'Maximum minimum order is $1000'),
  same_day_cutoff: cutoffTimeSchema,
  next_day_cutoff_enabled: z.boolean(),
  next_day_cutoff: cutoffTimeSchema,
  special_events: z.object({
    valentines_day: specialEventSettingsSchema,
    mothers_day: specialEventSettingsSchema,
  }),
});

// Business settings validation schema
export const businessSettingsSchema = z.object({
  delivery: deliverySettingsSchema,
  hours: z.object({
    monday: businessHoursSchema,
    tuesday: businessHoursSchema,
    wednesday: businessHoursSchema,
    thursday: businessHoursSchema,
    friday: businessHoursSchema,
    saturday: businessHoursSchema,
    sunday: businessHoursSchema,
  }),
  delivery_slots: deliverySlotsSchema,
});

// Florist profile validation schema
export const floristProfileSchema = z.object({
  store_name: z.string()
    .min(2, 'Store name must be at least 2 characters')
    .max(100, 'Store name cannot exceed 100 characters'),
  store_status: z.enum(['pending', 'active', 'inactive']),
  about_text: z.string()
    .max(500, 'About text cannot exceed 500 characters')
    .optional(),
  contact_email: z.string()
    .email('Invalid email address')
    .refine(val => isValidEmail(val), {
      message: 'Invalid email format',
    }),
  contact_phone: z.string()
    .regex(PHONE_PATTERN, 'Invalid phone number format')
    .refine(val => isValidPhone(val), {
      message: 'Invalid phone number',
    }),
  website_url: z.string()
    .regex(URL_PATTERN, 'Invalid URL format')
    .optional(),
  address: addressSchema,
  business_settings: businessSettingsSchema,
});

// Product validation schema
export const productSchema = z.object({
  name: z.string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name cannot exceed 100 characters'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(10000, 'Price cannot exceed $10,000'),
  status: z.enum(['active', 'inactive', 'deleted']),
  images: z.array(z.string().url('Invalid image URL'))
    .max(5, 'Maximum 5 images allowed')
    .optional()
    .default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Order validation schema
export const orderSchema = z.object({
  delivery_date: z.date()
    .min(new Date(), 'Delivery date must be in the future')
    .max(addDays(new Date(), 14), 'Delivery date cannot be more than 2 weeks in advance'),
  delivery_time_slot: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time slot format'),
  delivery_address: addressSchema,
  items: z.array(z.object({
    product_id: z.string().uuid('Invalid product ID'),
    quantity: z.number()
      .int('Quantity must be a whole number')
      .min(1, 'Quantity must be at least 1')
      .max(100, 'Maximum quantity is 100'),
  }))
    .min(1, 'Order must contain at least one item'),
});

export type OrderFormData = z.infer<typeof orderSchema>;

// Validation functions
export function validateAddress(address: unknown): { success: boolean; error?: string } {
  try {
    addressSchema.parse(address);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Invalid address data' };
  }
}

export function validateBusinessSettings(
  settings: unknown
): { success: boolean; error?: string } {
  try {
    businessSettingsSchema.parse(settings);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Invalid business settings data' };
  }
}

export function validateFloristProfile(
  profile: unknown
): { success: boolean; error?: string } {
  try {
    floristProfileSchema.parse(profile);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Invalid florist profile data' };
  }
}

export function validateProduct(
  product: unknown
): { success: boolean; error?: string } {
  try {
    productSchema.parse(product);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid product data',
      };
    }
    return { success: false, error: 'Invalid product data' };
  }
}

export function validateOrder(
  order: unknown
): { success: boolean; error?: string } {
  try {
    orderSchema.parse(order);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid order data',
      };
    }
    return { success: false, error: 'Invalid order data' };
  }
}

// Helper functions
export function isValidPostcode(postcode: string): boolean {
  // Australian postcode validation logic
  const numericPostcode = parseInt(postcode, 10);
  return (
    (numericPostcode >= 2000 && numericPostcode <= 2999) || // NSW
    (numericPostcode >= 3000 && numericPostcode <= 3999) || // VIC
    (numericPostcode >= 4000 && numericPostcode <= 4999) || // QLD
    (numericPostcode >= 5000 && numericPostcode <= 5999) || // SA
    (numericPostcode >= 6000 && numericPostcode <= 6999) || // WA
    (numericPostcode >= 7000 && numericPostcode <= 7999) || // TAS
    (numericPostcode >= 800 && numericPostcode <= 999)   || // NT
    (numericPostcode >= 200 && numericPostcode <= 299)      // ACT
  );
}

export function isValidPhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function isValidTime(time: string): boolean {
  return TIME_PATTERN.test(time);
}

export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
