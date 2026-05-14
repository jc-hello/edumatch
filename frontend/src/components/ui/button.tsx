'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'edm-gradient-bg text-white shadow-[var(--shadow-accent)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-accent-lg)] hover:brightness-110',
        outline:
          'border border-border bg-card text-foreground shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[var(--shadow-card-lg)]',
        secondary:
          'bg-muted text-foreground hover:-translate-y-0.5 hover:bg-[color-mix(in_oklab,var(--muted)_88%,var(--accent))]',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        link: 'text-accent underline-offset-4 hover:underline',
        destructive:
          'bg-red-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-700',
        invert:
          'bg-foreground text-background hover:-translate-y-0.5 hover:bg-foreground/90 shadow-[var(--shadow-card-lg)]',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        default: 'h-11 px-5',
        lg: 'h-14 px-7 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
