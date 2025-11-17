import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

const baseStyles = 'inline-flex items-center justify-center rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';

const variantStyles: Record<'primary' | 'secondary' | 'ghost', string> = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-soft hover:from-indigo-500 hover:to-violet-500',
  secondary: 'bg-white text-indigo-700 border border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50',
  ghost: 'bg-transparent text-indigo-700 hover:bg-indigo-100',
};

const sizeStyles: Record<'default' | 'lg' | 'sm', string> = {
  default: 'h-11 px-6 text-base',
  lg: 'h-12 px-8 text-lg',
  sm: 'h-9 px-4 text-sm',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'lg' | 'sm';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : 'button';

    return (
      <Component
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
