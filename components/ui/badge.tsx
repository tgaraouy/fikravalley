import * as React from 'react';

import { cn } from '@/lib/utils';

const variantStyles: Record<'default' | 'success' | 'outline', string> = {
  default: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  outline: 'border border-slate-300 text-slate-700 bg-white/60',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'outline';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-tight shadow-sm backdrop-blur-sm',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
