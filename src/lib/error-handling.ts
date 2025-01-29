import { toast } from 'sonner';

interface ErrorHandlerOptions {
  silent?: boolean;
  fallbackMessage?: string;
}

export function handleError(error: unknown) {
  // Log the error
  if (import.meta.env.DEV) {
    console.error('Error details:', error);
  }

  // Extract error message
  let message = 'An unexpected error occurred';
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  // Show toast unless silent is true
  if (!import.meta.env.PROD) {
    toast.error(message);
  }
  
  // Return the error message for potential use
  return message;
}

// Utility for common error messages
export const ErrorMessages = {
  LOAD_FAILED: 'Failed to load data. Please try again.',
  SAVE_FAILED: 'Failed to save changes. Please try again.',
  NETWORK_ERROR: 'Network connection issue. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_FAILED: 'Please check your input and try again.'
} as const; 