'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design-system';
import { type PlayerColorId, getPlayerColor } from '@/lib/design-system/tokens/colors';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'player';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  playerColor?: PlayerColorId;
  glow?: boolean;
  interactive?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

const variantStyles = {
  default: 'bg-gray-800 border border-gray-700',
  elevated: 'bg-gray-700 shadow-xl shadow-black/20',
  outlined: 'bg-gray-800/50 border-2 border-gray-600',
  glass: 'bg-gray-800/80 backdrop-blur-sm border border-gray-700/50',
  player: '', // Handled dynamically
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      playerColor,
      glow = false,
      interactive = false,
      header,
      footer,
      children,
      ...props
    },
    ref
  ) => {
    // Handle player color variant
    let playerStyles = '';
    let accentBar = null;

    if (variant === 'player' && playerColor) {
      const color = getPlayerColor(playerColor);
      playerStyles = 'bg-gray-800 border border-gray-700 overflow-hidden relative';
      accentBar = <div className={cn('absolute left-0 top-0 bottom-0 w-1.5', color.bg)} />;
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-xl',
          // Variant
          variant === 'player' ? playerStyles : variantStyles[variant],
          // Interactive styles
          interactive && 'cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
          // Glow effect
          glow && 'animate-card-glow',
          className
        )}
        {...props}
      >
        {accentBar}

        {header && (
          <div className={cn(
            'border-b border-gray-700',
            variant === 'player' ? 'pl-5 pr-4 py-4' : 'px-6 py-4'
          )}>
            {header}
          </div>
        )}

        <div className={cn(
          paddingStyles[padding],
          variant === 'player' && padding !== 'none' && 'pl-5'
        )}>
          {children}
        </div>

        {footer && (
          <div className={cn(
            'border-t border-gray-700',
            variant === 'player' ? 'pl-5 pr-4 py-4' : 'px-6 py-4'
          )}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';
