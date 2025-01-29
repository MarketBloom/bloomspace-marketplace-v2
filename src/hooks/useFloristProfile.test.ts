import { renderHook, waitFor } from '@/test/utils';
import { useFloristProfile } from './useFloristProfile';
import { supabase } from '@/integrations/supabase/client';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { FloristProfileRecord } from '@/types/florist';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      }))
    })),
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock the toast component
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useFloristProfile', () => {
  const mockFloristProfile: FloristProfileRecord = {
    id: '123',
    user_id: 'user123',
    store_name: 'Test Florist',
    store_status: 'active',
    created_at: '2025-01-23T12:00:00Z',
    updated_at: '2025-01-23T12:00:00Z',
    location: {
      type: 'Point',
      coordinates: [151.2093, -33.8688]
    },
    address_details: {
      street_number: '123',
      street_name: 'Test St',
      suburb: 'Test Suburb',
      state: 'NSW',
      postcode: '2000',
      country: 'Australia'
    },
    delivery_settings: {
      distance_type: 'radius',
      max_distance_km: 10,
      same_day_cutoff: '14:00',
      next_day_cutoff_enabled: true,
      next_day_cutoff: '18:00',
      minimum_order: 50,
      delivery_fee: 10
    },
    business_hours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false }
    },
    delivery_slots: {
      weekdays: {
        slots: [
          { name: 'Morning', start: '09:00', end: '12:00', enabled: true }
        ]
      },
      weekends: {
        slots: [
          { name: 'Morning', start: '10:00', end: '13:00', enabled: true }
        ]
      }
    },
    about_text: 'Test florist description',
    banner_url: 'https://example.com/banner.jpg',
    logo_url: 'https://example.com/logo.jpg',
    contact_email: 'test@example.com',
    contact_phone: '0400000000',
    website_url: 'https://example.com',
    social_links: { instagram: 'test_florist' },
    setup_progress: { completed_steps: ['basic', 'location'] },
    setup_completed_at: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFloristProfile', () => {
    it('should fetch florist profile successfully', async () => {
      const mockResponse = { data: mockFloristProfile, error: null };
      (supabase.from as any)().select().eq().single.mockResolvedValue(mockResponse);

      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await waitFor(() => result.current.getFloristProfile('123'));
      const profile = result.current.getFloristProfile('123');
      expect(profile).toEqual(mockFloristProfile);
    });

    it('should handle error when fetching profile', async () => {
      const mockError = { message: 'Failed to fetch' };
      (supabase.from as any)().select().eq().single.mockResolvedValue({ data: null, error: mockError });

      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await expect(result.current.getFloristProfile('123')).rejects.toThrow('Failed to fetch');
    });

    it('should throw error when profile ID is missing', async () => {
      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await expect(result.current.getFloristProfile('')).rejects.toThrow('Profile ID is required');
    });
  });

  describe('updateFloristProfile', () => {
    const updateData = {
      store_name: 'Updated Test Florist'
    };

    it('should update florist profile successfully', async () => {
      const mockResponse = { data: { ...mockFloristProfile, ...updateData }, error: null };
      (supabase.from as any)().update().eq().select().single.mockResolvedValue(mockResponse);

      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await waitFor(() => result.current.updateFloristProfile('123', updateData));
      const updatedProfile = result.current.updateFloristProfile('123', updateData);
      expect(updatedProfile).toEqual({ ...mockFloristProfile, ...updateData });
    });

    it('should handle error when updating profile', async () => {
      const mockError = { message: 'Failed to update' };
      (supabase.from as any)().update().eq().select().single.mockResolvedValue({ data: null, error: mockError });

      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await expect(result.current.updateFloristProfile('123', updateData)).rejects.toThrow('Failed to update');
    });

    it('should throw error when profile ID is missing', async () => {
      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await expect(result.current.updateFloristProfile('', updateData)).rejects.toThrow('Profile ID is required');
    });
  });

  describe('checkDeliveryAvailability', () => {
    const mockAvailabilityResponse = {
      can_deliver: true,
      reason: 'Within delivery range',
      estimated_distance: 5,
      estimated_duration: 15
    };

    it('should check delivery availability successfully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockAvailabilityResponse,
        error: null
      });

      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await waitFor(() => result.current.checkDeliveryAvailability('123', -33.8688, 151.2093));
      const availability = result.current.checkDeliveryAvailability('123', -33.8688, 151.2093);
      expect(availability).toEqual(mockAvailabilityResponse);
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'check-delivery-availability',
        expect.any(Object)
      );
    });

    it('should handle invalid coordinates', async () => {
      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await expect(
        result.current.checkDeliveryAvailability('123', NaN, 151.2093)
      ).rejects.toThrow('Invalid latitude');
    });

    it('should handle error when checking delivery availability', async () => {
      const mockError = new Error('Failed to check delivery availability');
      vi.mocked(supabase.functions.invoke).mockRejectedValue(mockError);

      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await expect(result.current.checkDeliveryAvailability('123', -33.8688, 151.2093)).rejects.toThrow('Failed to check delivery availability');
    });
  });

  describe('getDeliverySlots', () => {
    const mockSlots = [
      {
        name: 'Morning',
        start_time: '09:00',
        end_time: '12:00',
        available: true,
        reason: 'Available'
      }
    ];

    it('should fetch delivery slots successfully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockSlots,
        error: null
      });

      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await waitFor(() => result.current.getDeliverySlots('123', new Date('2025-01-24')));
      const slots = result.current.getDeliverySlots('123', new Date('2025-01-24'));
      expect(slots).toEqual(mockSlots);
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'get-delivery-slots',
        expect.any(Object)
      );
    });

    it('should handle invalid date', async () => {
      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await expect(
        // @ts-ignore - Testing invalid date input
        result.current.getDeliverySlots('123', 'invalid-date')
      ).rejects.toThrow('Invalid delivery date');
    });
  });

  describe('searchFlorists', () => {
    const mockSearchResults = [
      {
        id: '123',
        store_name: 'Test Florist',
        distance: 5,
        can_deliver: true,
        reason: 'Within delivery range'
      }
    ];

    it('should search florists successfully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockSearchResults,
        error: null
      });

      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await waitFor(() => result.current.searchFlorists(-33.8688, 151.2093, 10));
      const florists = result.current.searchFlorists(-33.8688, 151.2093, 10);
      expect(florists).toEqual(mockSearchResults);
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'search-florists',
        expect.any(Object)
      );
    });

    it('should handle invalid max distance', async () => {
      const queryClient = new QueryClient();
      const { result } = renderHook(() => useFloristProfile(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
      });

      await expect(
        result.current.searchFlorists(-33.8688, 151.2093, -1)
      ).rejects.toThrow('Invalid max distance');
    });
  });
});
