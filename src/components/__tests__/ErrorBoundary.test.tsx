import { render, screen } from '@/test/utils';
import { ErrorBoundary } from '../ErrorBoundary';
import { vi } from 'vitest';
import * as Sentry from '@sentry/react';

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  withScope: vi.fn((callback) => callback({ setExtra: vi.fn() })),
}));

describe('ErrorBoundary', () => {
  const ErrorComponent = () => {
    throw new Error('Test error');
    return null;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders fallback UI when error occurs', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
    
    consoleError.mockRestore();
  });

  it('reports error to Sentry', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
    
    consoleError.mockRestore();
  });

  it('allows retry after error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onReset = vi.fn();
    
    render(
      <ErrorBoundary onReset={onReset}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    retryButton.click();

    expect(onReset).toHaveBeenCalled();
    
    consoleError.mockRestore();
  });
});
