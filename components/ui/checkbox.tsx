import * as React from 'react';

import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, defaultChecked, ...props }, ref) => {
    // Ensure we only use either checked (controlled) or defaultChecked (uncontrolled), not both
    const inputProps = checked !== undefined
      ? { checked, ...props } // Controlled
      : defaultChecked !== undefined
      ? { defaultChecked, ...props } // Uncontrolled
      : props; // Neither (uncontrolled with no default)

    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          className={cn(
            'h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...inputProps}
        />
        {label && (
          <label htmlFor={props.id} className="text-sm font-medium text-slate-700 cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

