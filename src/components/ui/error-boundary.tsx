import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface Props {
  children: ReactNode;
  FallbackComponent?: React.ComponentType<FallbackProps>;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <h3 className="font-medium">Something went wrong</h3>
      </div>
      <p className="mt-2 text-destructive/80">{error.message}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={resetErrorBoundary}
        className="mt-4"
      >
        Try again
      </Button>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  public render() {
    const { FallbackComponent = DefaultFallback } = this.props;

    if (this.state.hasError && this.state.error) {
      return (
        <FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}