import { renderHook, act } from '@testing-library/react';
import { useFloristProfile } from '../useFloristProfile';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { FloristProfile } from '@/types/florist';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
  },
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn().mockReturnValue({
    toast: vi.fn(),
  }),
}));

// Test data
const mockFloristProfile: FloristProfile = {
  id: '123',
  user_id: 'user123',
  store_name: 'Test Florist',
  store_status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  location: {
    type: 'Point',
    coordinates: [151.2093, -33.8688], // Sydney coordinates
  },
  address_details: {
    street: '123 Test St',
    city: 'Sydney',
    state: 'NSW',
    postal_code: '2000',
    country: 'Australia',
  },
  delivery_settings: {
    distance_type: 'driving',
    max_distance_km: 20,
    same_day_cutoff: '14:00',
    next_day_cutoff_enabled: true,
    next_day_cutoff: '18:00',
    minimum_order: 50,
    delivery_fee: 10,
  },
  business_hours: {
    monday: { open: '09:00', close: '17:00' },
    tuesday: { open: '09:00', close: '17:00' },
    wednesday: { open: '09:00', close: '17:00' },
    thursday: { open: '09:00', close: '17:00' },
    friday: { open: '09:00', close: '17:00' },
    saturday: { open: '10:00', close: '16:00' },
    sunday: { open: '10:00', close: '16:00' },
  },
  delivery_slots: {
    monday: [{ start: '09:00', end: '12:00', max_orders: 5 }],
    tuesday: [{ start: '09:00', end: '12:00', max_orders: 5 }],
    wednesday: [{ start: '09:00', end: '12:00', max_orders: 5 }],
    thursday: [{ start: '09:00', end: '12:00', max_orders: 5 }],
    friday: [{ start: '09:00', end: '12:00', max_orders: 5 }],
    saturday: [{ start: '10:00', end: '14:00', max_orders: 3 }],
    sunday: [{ start: '10:00', end: '14:00', max_orders: 3 }],
  },
  about_text: 'Test florist description',
  banner_url: 'https://example.com/banner.jpg',
  logo_url: 'https://example.com/logo.jpg',
  contact_email: 'test@example.com',
  contact_phone: '+61234567890',
  website_url: 'https://example.com',
  social_links: {
    facebook: 'https://facebook.com/testflorist',
    instagram: 'https://instagram.com/testflorist',
  },
  setup_progress: {
    basic_info: true,
    location: true,
    delivery: true,
    business_hours: true,
    about: true,
  },
  setup_completed_at: new Date().toISOString(),
};

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useFloristProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Profile Validation', () => {
    it('validates store name length', async () => {
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.updateFloristProfile('123', {
          store_name: 'A', // Too short
        })
      ).rejects.toThrow('Store name must be at least 2 characters long');
    });

    it('validates location coordinates', async () => {
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.updateFloristProfile('123', {
          location: {
            type: 'Point',
            coordinates: [200, -33.8688], // Invalid longitude
          },
        })
      ).rejects.toThrow('Invalid latitude');
    });

    it('validates delivery settings', async () => {
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.updateFloristProfile('123', {
          delivery_settings: {
            ...mockFloristProfile.delivery_settings,
            max_distance_km: 150, // Too far
          },
        })
      ).rejects.toThrow('Invalid max distance');
    });

    it('validates business hours format', async () => {
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.updateFloristProfile('123', {
          business_hours: {
            monday: { open: '25:00', close: '17:00' }, // Invalid hour
          },
        })
      ).rejects.toThrow('Invalid business hours for monday');
    });

    it('validates contact information', async () => {
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.updateFloristProfile('123', {
          contact_email: 'invalid-email',
        })
      ).rejects.toThrow('Invalid email format');

      await expect(
        result.current.updateFloristProfile('123', {
          contact_phone: '123', // Too short
        })
      ).rejects.toThrow('Invalid phone number format');
    });
  });

  describe('Profile Updates', () => {
    it('successfully updates profile with valid data', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => ({
                data: mockFloristProfile,
                error: null,
              }),
            }),
          }),
        }),
      }));

      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: createWrapper(),
      });

      const updateData = {
        store_name: 'Updated Store Name',
        about_text: 'Updated description',
      };

      await act(async () => {
        await result.current.updateFloristProfile('123', updateData);
      });

      expect(useToast().toast).toHaveBeenCalledWith({
        description: 'Profile updated successfully',
      });
    });

    it('handles update errors gracefully', async () => {
      const mockError = new Error('Database error');
      vi.mocked(supabase.from).mockImplementation(() => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => ({
                data: null,
                error: mockError,
              }),
            }),
          }),
        }),
      }));

      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await expect(
          result.current.updateFloristProfile('123', { store_name: 'Test Store' })
        ).rejects.toThrow();
      });

      expect(useToast().toast).toHaveBeenCalledWith({
        variant: 'destructive',
        description: expect.any(String),
      });
    });
  });

  describe('Profile Queries', () => {
    it('fetches profile data successfully', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => ({
              data: mockFloristProfile,
              error: null,
            }),
          }),
        }),
      }));

      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.fetchFloristProfile('123');
      });
    });

    it('handles fetch errors gracefully', async () => {
      const mockError = new Error('Not found');
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => ({
              data: null,
              error: mockError,
            }),
          }),
        }),
      }));

      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await expect(result.current.fetchFloristProfile('123')).rejects.toThrow();
      });

      expect(useToast().toast).toHaveBeenCalledWith({
        variant: 'destructive',
        description: expect.any(String),
      });
    });
  });
});
