import * as React from 'react';
import { cn } from '@/presentation/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  'inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        default: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-3',
        xl: 'h-12 w-12 border-4',
      },
      variant: {
        default: 'text-primary',
        secondary: 'text-secondary',
        destructive: 'text-destructive',
        muted: 'text-muted-foreground',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label || 'Loading'}
        className={cn(spinnerVariants({ size, variant }), className)}
        {...props}
      >
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );
  }
);
Spinner.displayName = 'Spinner';

export { Spinner, spinnerVariants };
