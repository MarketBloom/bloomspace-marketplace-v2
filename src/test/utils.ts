import { render as rtlRender } from '@testing-library/react';
import { FloristProfile, DeliverySettingsJson, BusinessHoursJson } from '@/types/florist';

// Mock toast functions
export const mockToast = vi.fn();
export const mockUseToast = () => ({
  toast: mockToast,
});

// Create a mock florist profile for testing
export const createMockFloristProfile = (): Partial<FloristProfile> => ({
  store_name: 'Test Store',
  about_text: 'About test store',
  contact_email: 'test@example.com',
  contact_phone: '+1234567890',
  website_url: 'https://example.com',
  delivery_settings: {
    distance_type: 'radius',
    max_distance_km: 10,
    same_day_cutoff: '14:00',
    next_day_cutoff_enabled: true,
    next_day_cutoff: '18:00',
    minimum_order: 50,
    delivery_fee: 10
  } as DeliverySettingsJson,
  business_hours: {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '00:00', close: '00:00', closed: true }
  } as BusinessHoursJson
});

// Custom render function that includes providers if needed
export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, { ...options });
}

// Re-export everything
export * from '@testing-library/react';
