import * as Sentry from '@sentry/react';

// Initialize Sentry only if DSN is provided
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
  });
}

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureException(error);
    });
  } else {
    console.error('Error:', error, 'Context:', context);
  }
};

export const setUserContext = (user: { id: string; email?: string }) => {
  if (SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  }
};

export const clearUserContext = () => {
  if (SENTRY_DSN) {
    Sentry.setUser(null);
  }
};
