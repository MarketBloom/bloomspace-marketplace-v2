import { AuthError, AuthApiError } from '@supabase/supabase-js';

interface AuthErrorMessages {
  [key: string]: string;
}

const AUTH_ERROR_MESSAGES: AuthErrorMessages = {
  'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
  'Email not confirmed': 'Please check your email to confirm your account before logging in.',
  'Email already in use': 'This email is already registered. Please use a different email or try logging in.',
  'Password is too weak': 'Please choose a stronger password. It should be at least 8 characters long and include numbers and special characters.',
  'User not found': 'No account found with this email. Please check the email or sign up for a new account.',
};

export function useAuthError() {
  const getErrorMessage = (error: Error | AuthError | null) => {
    if (!error) return null;

    // Handle AuthApiError specifically
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          // Check for specific error messages
          for (const [key, message] of Object.entries(AUTH_ERROR_MESSAGES)) {
            if (error.message.includes(key)) {
              return message;
            }
          }
          break;
        case 401:
          return 'Your session has expired. Please log in again.';
        case 422:
          return 'Invalid email format. Please enter a valid email address.';
        case 429:
          return 'Too many attempts. Please try again later.';
      }
    }

    // Handle other specific error messages
    for (const [key, message] of Object.entries(AUTH_ERROR_MESSAGES)) {
      if (error.message.includes(key)) {
        return message;
      }
    }

    // Default error message
    return 'An unexpected error occurred. Please try again later.';
  };

  return { getErrorMessage };
}
