import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });
}

interface RenderOptions {
  withToast?: boolean;
  withQuery?: boolean;
  [key: string]: any;
}

function customRender(
  ui: React.ReactElement,
  {
    withToast = true,
    withQuery = true,
    ...renderOptions
  }: RenderOptions = {}
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    let wrapped = children;

    if (withQuery) {
      wrapped = (
        <QueryClientProvider client={queryClient}>
          {wrapped}
        </QueryClientProvider>
      );
    }

    if (withToast) {
      wrapped = (
        <Toaster>
          {wrapped}
        </Toaster>
      );
    }

    return <>{wrapped}</>;
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
    user: userEvent.setup(),
  };
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Common test utilities
export function createMockFloristProfile() {
  return {
    id: '123',
    user_id: '456',
    store_name: 'Test Florist',
    store_status: 'active',
    created_at: '2025-01-24T00:00:00Z',
    updated_at: '2025-01-24T00:00:00Z',
    location: null,
    address_details: {
      street_number: '123',
      street_name: 'Test St',
      suburb: 'Test Suburb',
      state: 'Test State',
      postcode: '1234',
    },
    delivery_settings: {
      distance_type: 'radius',
      max_distance_km: 10,
      same_day_cutoff: '14:00',
      next_day_cutoff_enabled: true,
      next_day_cutoff: '18:00',
      minimum_order: 50,
      delivery_fee: 10,
    },
    business_hours: {},
    delivery_slots: { weekdays: { slots: [] }, weekends: { slots: [] } },
    about_text: null,
    banner_url: null,
    logo_url: null,
    contact_email: null,
    contact_phone: null,
    website_url: null,
    social_links: null,
    setup_progress: { completed_steps: [] },
    setup_completed_at: null,
  } as const;
}

export const mockToast = vi.fn();
export const mockUseToast = vi.fn(() => ({ toast: mockToast }));
