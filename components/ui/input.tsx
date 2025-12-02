'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/design-system';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm min-h-[32px]',
  md: 'px-4 py-2.5 text-base min-h-[44px]',
  lg: 'px-4 py-3 text-lg min-h-[52px]',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      inputSize = 'md',
      fullWidth = true,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-300"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            // Base styles
            'rounded-lg border bg-gray-800 text-white placeholder-gray-500',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
            // Size
            sizeStyles[inputSize],
            // Width
            fullWidth && 'w-full',
            // States
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-600 hover:border-gray-500',
            // Disabled
            props.disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...props}
        />

        {hint && !error && (
          <p className="text-sm text-gray-500">{hint}</p>
        )}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
