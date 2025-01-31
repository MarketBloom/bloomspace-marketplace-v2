import { cn } from '../../lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div
      className={cn('animate-spin', className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <div
        className={cn(
          'border-current border-t-transparent rounded-full',
          {
            'w-4 h-4 border-2': size === 'sm',
            'w-8 h-8 border-3': size === 'md',
            'w-12 h-12 border-4': size === 'lg',
          }
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
