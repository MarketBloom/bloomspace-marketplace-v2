import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DeliverySettingsForm } from '../DeliverySettingsForm';
import type { DeliverySettingsJson } from '@/types/florist';
import React from 'react';

// Mock the hooks
const mockConfirm = vi.fn().mockResolvedValue(true);
vi.mock('@/hooks/useConfirmDialog.tsx', () => ({
  useConfirmDialog: () => ({
    confirm: mockConfirm,
  }),
}));

// Mock the useToast hook
const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock the Select component
vi.mock('@/components/ui/select', () => ({
  Select: ({ onValueChange, defaultValue, disabled, children }: any) => {
    const [value, setValue] = React.useState(defaultValue);
    
    // Extract options from children
    const options = React.Children.toArray(children)
      .flatMap(child => {
        if (child.type === 'option') return [child];
        if (child.props?.children) {
          return React.Children.toArray(child.props.children)
            .flatMap(grandChild => {
              if (grandChild.type === 'option') return [grandChild];
              if (grandChild.props?.value) {
                return [{
                  type: 'option',
                  props: {
                    value: grandChild.props.value,
                    children: grandChild.props.children
                  }
                }];
              }
              return [];
            });
        }
        return [];
      });
    
    return (
      <select
        data-testid="distance-type-select"
        value={value || ''}
        disabled={disabled}
        onChange={(e) => {
          const newValue = e.target.value;
          setValue(newValue);
          onValueChange?.(newValue);
        }}
      >
        {options.map((option, index) => (
          <option key={index} value={option.props.value}>
            {option.props.children}
          </option>
        ))}
      </select>
    );
  },
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ children }: any) => <span>{children}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
}));

describe('DeliverySettingsForm', () => {
  const mockInitialData: DeliverySettingsJson = {
    distance_type: 'driving',
    max_distance_km: 10,
    same_day_cutoff: '14:00',
    next_day_cutoff_enabled: true,
    next_day_cutoff: '18:00',
    minimum_order: 50,
    delivery_fee: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders with initial data', () => {
      render(<DeliverySettingsForm initialData={mockInitialData} onSubmit={vi.fn()} />);
      
      // Check numeric inputs
      expect(screen.getByRole('spinbutton', { name: /maximum delivery distance/i })).toHaveValue(10);
      expect(screen.getByRole('spinbutton', { name: /delivery fee/i })).toHaveValue(10);
      expect(screen.getByRole('spinbutton', { name: /minimum order/i })).toHaveValue(50);
      
      // Check time inputs
      expect(screen.getByLabelText(/same day.*cutoff/i)).toHaveValue('14:00');
      expect(screen.getByLabelText(/next day.*cutoff/i)).toHaveValue('18:00');
      
      // Check select
      expect(screen.getByTestId('distance-type-select')).toHaveValue('driving');
    });

    it('uses default values when no initial data provided', () => {
      render(<DeliverySettingsForm onSubmit={vi.fn()} />);
      
      expect(screen.getByRole('spinbutton', { name: /maximum delivery distance/i })).toHaveValue(10);
      expect(screen.getByRole('spinbutton', { name: /delivery fee/i })).toHaveValue(10);
      expect(screen.getByRole('spinbutton', { name: /minimum order/i })).toHaveValue(50);
      expect(screen.getByLabelText(/same day.*cutoff/i)).toHaveValue('14:00');
      expect(screen.getByLabelText(/next day.*cutoff/i)).toHaveValue('18:00');
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      const onSubmit = vi.fn();
      render(<DeliverySettingsForm initialData={mockInitialData} onSubmit={onSubmit} />);
      
      // Clear max distance input
      const maxDistanceInput = screen.getByRole('spinbutton', { name: /maximum delivery distance/i });
      await userEvent.clear(maxDistanceInput);
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /save settings/i });
      await userEvent.click(submitButton);
      
      // Verify validation error
      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    it('validates numeric field boundaries', async () => {
      render(<DeliverySettingsForm initialData={mockInitialData} onSubmit={vi.fn()} />);
      
      // Test max distance boundaries
      const maxDistanceInput = screen.getByRole('spinbutton', { name: /maximum delivery distance/i });
      await userEvent.clear(maxDistanceInput);
      await userEvent.type(maxDistanceInput, '0');
      
      const submitButton = screen.getByRole('button', { name: /save settings/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/distance must be greater than 0/i)).toBeInTheDocument();
      });

      // Test delivery fee boundaries
      const deliveryFeeInput = screen.getByRole('spinbutton', { name: /delivery fee/i });
      await userEvent.clear(deliveryFeeInput);
      await userEvent.type(deliveryFeeInput, '1001');

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/fee cannot exceed \$1000/i)).toBeInTheDocument();
      });
    });

    it('validates cutoff times', async () => {
      render(<DeliverySettingsForm initialData={mockInitialData} onSubmit={vi.fn()} />);
      
      // Set next day cutoff before same day
      const sameDayCutoff = screen.getByLabelText(/same day.*cutoff/i);
      const nextDayCutoff = screen.getByLabelText(/next day.*cutoff/i);
      
      await userEvent.clear(sameDayCutoff);
      await userEvent.type(sameDayCutoff, '18:00');
      
      await userEvent.clear(nextDayCutoff);
      await userEvent.type(nextDayCutoff, '17:00');
      
      const submitButton = screen.getByRole('button', { name: /save settings/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Invalid Cutoff Times",
          description: "Next day cutoff time must be after same day cutoff time",
          variant: "destructive",
        });
      });
    });
  });

  describe('Form Interactions', () => {
    it('updates distance type via select', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<DeliverySettingsForm initialData={mockInitialData} onSubmit={onSubmit} />);
      
      // Change select value
      const select = screen.getByTestId('distance-type-select');
      await userEvent.selectOptions(select, 'radius');
      
      // Update max distance
      const maxDistanceInput = screen.getByRole('spinbutton', { name: /maximum delivery distance/i });
      await userEvent.clear(maxDistanceInput);
      await userEvent.type(maxDistanceInput, '20');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /save settings/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
          distance_type: 'radius',
          max_distance_km: '20',
        }));
      });
    });

    it('handles form reset', async () => {
      render(<DeliverySettingsForm initialData={mockInitialData} onSubmit={vi.fn()} />);
      
      // Modify a field
      const maxDistanceInput = screen.getByRole('spinbutton', { name: /maximum delivery distance/i });
      await userEvent.clear(maxDistanceInput);
      await userEvent.type(maxDistanceInput, '20');
      
      // Click reset
      const resetButton = screen.getByRole('button', { name: /reset settings/i });
      await userEvent.click(resetButton);
      
      // Confirm reset
      expect(mockConfirm).toHaveBeenCalledWith({
        title: "Reset Delivery Settings?",
        description: "Are you sure you want to reset all delivery settings? This will discard all your changes.",
        confirmText: "Reset Settings",
        cancelText: "Keep Editing",
        variant: "destructive"
      });

      // Check values are reset
      await waitFor(() => {
        expect(maxDistanceInput).toHaveValue(10);
      });
    });
  });

  describe('Loading States', () => {
    it('disables all inputs while submitting', async () => {
      const onSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const { container } = render(<DeliverySettingsForm initialData={mockInitialData} onSubmit={onSubmit} />);
      
      // Make form dirty
      const maxDistanceInput = screen.getByRole('spinbutton', { name: /maximum delivery distance/i });
      await userEvent.clear(maxDistanceInput);
      await userEvent.type(maxDistanceInput, '20');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /save settings/i });
      await userEvent.click(submitButton);
      
      // Wait for form submission to start
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
      
      // Check all inputs are disabled
      const inputs = container.querySelectorAll('input, select');
      const buttons = screen.getAllByRole('button');
      
      inputs.forEach(input => {
        expect(input).toBeDisabled();
      });
      
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('shows loading state while submitting', async () => {
      const onSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<DeliverySettingsForm initialData={mockInitialData} onSubmit={onSubmit} />);

      // Make form dirty
      const maxDistanceInput = screen.getByRole('spinbutton', { name: /maximum delivery distance/i });
      await userEvent.clear(maxDistanceInput);
      await userEvent.type(maxDistanceInput, '20');

      const submitButton = screen.getByRole('button', { name: /save settings/i });
      await userEvent.click(submitButton);

      // Check loading state
      await waitFor(() => {
        expect(submitButton).toHaveTextContent(/saving/i);
      });

      // Wait for submission to complete
      await waitFor(() => {
        expect(submitButton).toHaveTextContent(/save settings/i);
      });
    });
  });

  describe('Network Scenarios', () => {
    it('handles network errors gracefully', async () => {
      const error = new Error('Network error');
      const onSubmit = vi.fn().mockRejectedValue(error);
      
      // Catch unhandled rejections for this test
      const rejectionHandler = vi.fn();
      window.addEventListener('unhandledrejection', rejectionHandler);
      
      render(<DeliverySettingsForm initialData={mockInitialData} onSubmit={onSubmit} />);
      
      // Make form dirty
      const maxDistanceInput = screen.getByRole('spinbutton', { name: /maximum delivery distance/i });
      await userEvent.clear(maxDistanceInput);
      await userEvent.type(maxDistanceInput, '20');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /save settings/i });
      await userEvent.click(submitButton);
      
      // Wait for error toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: expect.stringContaining('Network error'),
          variant: 'destructive'
        });
      });
      
      // Verify form is interactive again
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(maxDistanceInput).not.toBeDisabled();
      });
      
      // Clean up
      window.removeEventListener('unhandledrejection', rejectionHandler);
    });

    it('allows retry after network failure', async () => {
      const error = new Error('Network error');
      const onSubmit = vi.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(undefined);
      
      // Catch unhandled rejections for this test
      const rejectionHandler = vi.fn();
      window.addEventListener('unhandledrejection', rejectionHandler);
      
      render(<DeliverySettingsForm initialData={mockInitialData} onSubmit={onSubmit} />);
      
      // Make form dirty
      const maxDistanceInput = screen.getByRole('spinbutton', { name: /maximum delivery distance/i });
      await userEvent.clear(maxDistanceInput);
      await userEvent.type(maxDistanceInput, '20');
      
      // First attempt - fails
      const submitButton = screen.getByRole('button', { name: /save settings/i });
      await userEvent.click(submitButton);
      
      // Wait for error toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: expect.stringContaining('Network error'),
          variant: 'destructive'
        });
      });
      
      // Wait for form to be interactive
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      
      // Clear previous mock calls
      mockToast.mockClear();
      
      // Second attempt - succeeds
      await userEvent.click(submitButton);
      
      // Check success toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Delivery settings updated successfully'
        });
      });
      
      // Verify both attempts were made
      expect(onSubmit).toHaveBeenCalledTimes(2);
      
      // Clean up
      window.removeEventListener('unhandledrejection', rejectionHandler);
    });
  });

  describe('Cleanup Behavior', () => {
    it('warns about unsaved changes on window close', async () => {
      render(<DeliverySettingsForm initialData={mockInitialData} onSubmit={vi.fn()} />);

      const maxDistanceInput = screen.getByRole('spinbutton', { name: /maximum delivery distance/i });
      await userEvent.clear(maxDistanceInput);
      await userEvent.type(maxDistanceInput, '20');

      // Create a spy for preventDefault
      const preventDefaultSpy = vi.fn();
      const event = new Event('beforeunload');
      Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });
      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('removes beforeunload handler on unmount', () => {
      const preventDefaultSpy = vi.fn();
      const { unmount } = render(<DeliverySettingsForm initialData={mockInitialData} onSubmit={vi.fn()} />);

      // Unmount the component
      unmount();

      // Create and dispatch event after unmount
      const event = new Event('beforeunload');
      Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });
      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });
});
