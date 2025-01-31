import { toast } from '../hooks/use-toast';

interface ErrorHandlerOptions {
  silent?: boolean;
  fallbackMessage?: string;
}

export function handleError(error: unknown, options: ErrorHandlerOptions = {}) {
  // Log the error in development
  if (import.meta.env.DEV) {
    console.error('Error details:', error);
  }

  // Extract error message
  let message = options.fallbackMessage || 'An unexpected error occurred';
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  // Show toast unless silent is true
  if (!options.silent) {
    toast.error('Error', message);
  }
  
  // Return the error message for potential use
  return message;
}

// Common error messages
export const ErrorMessages = {
  LOAD_FAILED: 'Failed to load data. Please try again.',
  SAVE_FAILED: 'Failed to save changes. Please try again.',
  NETWORK_ERROR: 'Network connection issue. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_FAILED: 'Please check your input and try again.',
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  ORDER_FAILED: 'Failed to place order. Please try again.',
  DELIVERY_ERROR: 'Unable to calculate delivery. Please check the address.',
  FLORIST_NOT_FOUND: 'Florist not found or unavailable.',
  PRODUCT_NOT_FOUND: 'Product not found or no longer available.',
} as const; 