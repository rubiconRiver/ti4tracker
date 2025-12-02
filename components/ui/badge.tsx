'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/design-system';
import { type PlayerColorId, getPlayerColor } from '@/lib/design-system/tokens/colors';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'player' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  playerColor?: PlayerColorId;
  pulse?: boolean;
  icon?: ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-700 text-gray-200',
  success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  outline: 'bg-transparent text-gray-300 border border-gray-600',
  player: '', // Handled dynamically
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  playerColor,
  pulse = false,
  icon,
  className,
}: BadgeProps) {
  // Handle player color variant
  let playerStyles = '';
  if (variant === 'player' && playerColor) {
    const color = getPlayerColor(playerColor);
    playerStyles = `${color.bg} ${color.text}`;
  }

  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap',
        // Variant
        variant === 'player' ? playerStyles : variantStyles[variant],
        // Size
        sizeStyles[size],
        // Pulse animation
        pulse && 'animate-pulse',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
