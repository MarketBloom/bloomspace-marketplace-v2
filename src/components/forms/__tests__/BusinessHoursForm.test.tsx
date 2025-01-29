import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BusinessHoursForm } from '../BusinessHoursForm';
import { BusinessHours } from '@/types/florist';

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

describe('BusinessHoursForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading States', () => {
    it('renders with initial data', () => {
      const initialData = {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true },
      };

      render(<BusinessHoursForm initialData={initialData} onSubmit={vi.fn()} />);

      // Check if all days are rendered
      expect(screen.getByText(/monday/i)).toBeInTheDocument();
      expect(screen.getByText(/tuesday/i)).toBeInTheDocument();
      expect(screen.getByText(/wednesday/i)).toBeInTheDocument();
      expect(screen.getByText(/thursday/i)).toBeInTheDocument();
      expect(screen.getByText(/friday/i)).toBeInTheDocument();
      expect(screen.getByText(/saturday/i)).toBeInTheDocument();
      expect(screen.getByText(/sunday/i)).toBeInTheDocument();
    });

    it('disables all inputs while submitting', async () => {
      const onSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<BusinessHoursForm onSubmit={onSubmit} />);

      // Make the form dirty first
      const mondayOpenInput = screen.getByLabelText('Open', { selector: 'input[name="monday.open"]' });
      const mondayCloseInput = screen.getByLabelText('Close', { selector: 'input[name="monday.close"]' });
      
      await userEvent.clear(mondayOpenInput);
      await userEvent.type(mondayOpenInput, '10:00');

      const submitButton = screen.getByRole('button', { name: /save/i });

      // Submit the form
      await userEvent.click(submitButton);

      // Now check if inputs are disabled during submission
      await waitFor(() => {
        expect(mondayOpenInput).toHaveAttribute('disabled');
        expect(mondayCloseInput).toHaveAttribute('disabled');
      });
    });

    it('shows loading state while submitting', async () => {
      const onSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<BusinessHoursForm onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      // Check for loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Network Scenarios', () => {
    it('handles network errors gracefully', async () => {
      const error = new Error('Network error');
      const onSubmit = vi.fn().mockImplementation(() => Promise.reject(error));
      render(<BusinessHoursForm onSubmit={onSubmit} />);

      // Make the form dirty first
      const mondayOpenInput = screen.getByLabelText('Open', { selector: 'input[name="monday.open"]' });
      await userEvent.clear(mondayOpenInput);
      await userEvent.type(mondayOpenInput, '10:00');

      const submitButton = screen.getByRole('button', { name: /save/i });
      
      // Submit form and handle error
      try {
        await userEvent.click(submitButton);
      } catch (e) {
        // Expected error
      }

      // Wait for the error to be handled and toast to be shown
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: expect.stringContaining('Network error'),
          variant: "destructive",
        });
      });

      // Verify the form is no longer submitting
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('allows retry after network failure', async () => {
      const error = new Error('Network error');
      const onSubmit = vi.fn()
        .mockImplementationOnce(() => Promise.reject(error))
        .mockImplementationOnce(() => Promise.resolve());
      
      render(<BusinessHoursForm onSubmit={onSubmit} />);

      // Make the form dirty first
      const mondayOpenInput = screen.getByLabelText('Open', { selector: 'input[name="monday.open"]' });
      await userEvent.clear(mondayOpenInput);
      await userEvent.type(mondayOpenInput, '10:00');

      const submitButton = screen.getByRole('button', { name: /save/i });
      
      // First attempt - fails
      try {
        await userEvent.click(submitButton);
      } catch (e) {
        // Expected error
      }

      // Wait for the error toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: expect.stringContaining('Network error'),
          variant: "destructive",
        });
      });

      // Wait for the form to be interactive again
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      // Clear previous mock calls
      mockToast.mockClear();

      // Second attempt - succeeds
      await userEvent.click(submitButton);
      
      // Wait for success toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Success",
          description: "Business hours updated successfully",
        });
      });

      // Verify both attempts were made
      expect(onSubmit).toHaveBeenCalledTimes(2);
    });
  });

  describe('Form State', () => {
    it('tracks form dirty state', async () => {
      render(<BusinessHoursForm onSubmit={vi.fn()} />);

      const mondayOpenInput = screen.getByLabelText('Open', { selector: 'input[name="monday.open"]' });
      await userEvent.clear(mondayOpenInput);
      await userEvent.type(mondayOpenInput, '10:00');

      // Submit button should be enabled when form is dirty
      const submitButton = screen.getByRole('button', { name: /save/i });
      expect(submitButton).toBeEnabled();
    });

    it('warns about unsaved changes on window close', async () => {
      const { unmount } = render(<BusinessHoursForm onSubmit={vi.fn()} />);

      const mondayOpenInput = screen.getByLabelText('Open', { selector: 'input[name="monday.open"]' });
      await userEvent.clear(mondayOpenInput);
      await userEvent.type(mondayOpenInput, '10:00');

      // Create a spy for preventDefault
      const preventDefaultSpy = vi.fn();
      const event = new Event('beforeunload');
      Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });
      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      unmount();
    });

    it('removes beforeunload handler on unmount', () => {
      const preventDefaultSpy = vi.fn();
      const { unmount } = render(<BusinessHoursForm onSubmit={vi.fn()} />);

      // Unmount the component
      unmount();

      // Create and dispatch event after unmount
      const event = new Event('beforeunload');
      Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });
      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    it('validates time ranges', async () => {
      render(<BusinessHoursForm onSubmit={vi.fn()} />);

      // Set invalid time range (close before open)
      const mondayOpenInput = screen.getByLabelText('Open', { selector: 'input[name="monday.open"]' });
      const mondayCloseInput = screen.getByLabelText('Close', { selector: 'input[name="monday.close"]' });

      await userEvent.clear(mondayOpenInput);
      await userEvent.type(mondayOpenInput, '17:00');
      await userEvent.clear(mondayCloseInput);
      await userEvent.type(mondayCloseInput, '09:00');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Invalid Hours",
          description: expect.stringContaining('monday'),
          variant: "destructive",
        });
      });
    });
  });
});
