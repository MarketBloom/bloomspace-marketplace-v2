import { render, screen, waitFor } from '@/test/utils';
import { ProfileDetailsForm } from '../ProfileDetailsForm';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mockToast, mockUseToast, createMockFloristProfile } from '@/test/utils';
import userEvent from '@testing-library/user-event';

// Mock the useToast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => mockUseToast(),
}));

describe('ProfileDetailsForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial data', () => {
    const initialData = createMockFloristProfile();
    render(<ProfileDetailsForm initialData={initialData} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/store name/i)).toHaveValue(initialData.store_name);
    expect(screen.getByLabelText(/about/i)).toHaveValue(initialData.about_text);
    expect(screen.getByLabelText(/contact email/i)).toHaveValue(initialData.contact_email);
    expect(screen.getByLabelText(/contact phone/i)).toHaveValue(initialData.contact_phone);
    expect(screen.getByLabelText(/website url/i)).toHaveValue(initialData.website_url);
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<ProfileDetailsForm onSubmit={mockOnSubmit} />);

    // Try to submit with empty fields
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    // Check for validation error
    const storeNameInput = screen.getByLabelText(/store name/i);
    expect(storeNameInput).toHaveAttribute('aria-invalid', 'true');
    const errorId = storeNameInput.getAttribute('aria-describedby');
    const errorMessage = document.getElementById(errorId || '');
    expect(errorMessage).toHaveTextContent('Store name is required');
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<ProfileDetailsForm onSubmit={mockOnSubmit} />);

    // Fill in required field first
    await user.type(screen.getByLabelText(/store name/i), 'Test Store');
    await user.type(screen.getByLabelText(/contact email/i), 'invalid-email');

    // Submit form
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    // Wait for validation message using aria-describedby
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/contact email/i);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      const errorId = emailInput.getAttribute('aria-describedby');
      const errorMessage = document.getElementById(errorId || '');
      expect(errorMessage).toHaveTextContent('Please enter a valid email address');
    });
  });

  it('validates website URL format', async () => {
    const user = userEvent.setup();
    render(<ProfileDetailsForm onSubmit={mockOnSubmit} />);

    // Fill in required field first
    await user.type(screen.getByLabelText(/store name/i), 'Test Store');
    await user.type(screen.getByLabelText(/website url/i), 'invalid-url');

    // Submit form
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    // Wait for validation message using aria-describedby
    await waitFor(() => {
      const urlInput = screen.getByLabelText(/website url/i);
      expect(urlInput).toHaveAttribute('aria-invalid', 'true');
      const errorId = urlInput.getAttribute('aria-describedby');
      const errorMessage = document.getElementById(errorId || '');
      expect(errorMessage).toHaveTextContent('Please enter a valid website URL');
    });
  });

  it('validates phone number format', async () => {
    const user = userEvent.setup();
    render(<ProfileDetailsForm onSubmit={mockOnSubmit} />);

    // Fill in required field first
    await user.type(screen.getByLabelText(/store name/i), 'Test Store');
    await user.type(screen.getByLabelText(/contact phone/i), 'invalid-phone');

    // Submit form
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    // Wait for validation message
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
    });
  });

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup();
    const error = new Error('Network error');
    mockOnSubmit.mockRejectedValueOnce(error);

    render(
      <ProfileDetailsForm 
        initialData={{ store_name: 'Test Store' }} 
        onSubmit={mockOnSubmit} 
      />
    );

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    // Wait for onSubmit to be called and rejected
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          store_name: 'Test Store'
        })
      );
    });

    // Wait for the error to be handled and toast to be shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to save profile details: Network error',
        variant: 'destructive',
      });
    });
  });

  it('trims whitespace from text inputs', async () => {
    const user = userEvent.setup();
    render(<ProfileDetailsForm onSubmit={mockOnSubmit} />);

    // Fill in all fields with whitespace
    await user.type(screen.getByLabelText(/store name/i), '  Test Store  ');
    await user.type(screen.getByLabelText(/about/i), '  About test store  ');
    await user.type(screen.getByLabelText(/contact email/i), '  test@example.com  ');
    await user.type(screen.getByLabelText(/contact phone/i), '  +1234567890  ');
    await user.type(screen.getByLabelText(/website url/i), '  https://example.com  ');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    // Wait for form submission with trimmed values
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        store_name: 'Test Store',
        about_text: 'About test store',
        contact_email: 'test@example.com',
        contact_phone: '+1234567890',
        website_url: 'https://example.com'
      }));
    }, { timeout: 3000 });
  });

  it('sanitizes HTML in text inputs', async () => {
    const user = userEvent.setup();
    const formData = {
      store_name: 'Test Store',
      about_text: '<script>alert("xss")</script>Test Description',
      contact_email: 'test@example.com',
    };

    render(<ProfileDetailsForm initialData={formData} onSubmit={mockOnSubmit} />);

    // Submit form with sanitized values
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    // Wait for form submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          store_name: 'Test Store',
          about_text: 'Test Description',
          contact_email: 'test@example.com',
        })
      );
    });
  });
});
