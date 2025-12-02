'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design-system';
import { type PlayerColorId, getPlayerColor } from '@/lib/design-system/tokens/colors';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'player';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  playerColor?: PlayerColorId;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25',
  secondary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25',
  ghost: 'bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600 hover:border-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/25',
  player: '', // Handled dynamically
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm min-h-[32px]',
  md: 'px-4 py-2.5 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[52px]',
  xl: 'px-8 py-4 text-xl min-h-[64px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      playerColor,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Handle player color variant
    let playerStyles = '';
    if (variant === 'player' && playerColor) {
      const color = getPlayerColor(playerColor);
      playerStyles = `${color.bg} ${color.text} hover:opacity-90`;
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 font-medium rounded-xl',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500',
          'active:scale-[0.98]',
          // Variant
          variant === 'player' ? playerStyles : variantStyles[variant],
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          // Disabled state
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';
