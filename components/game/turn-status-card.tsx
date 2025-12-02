'use client';

import { cn } from '@/lib/design-system';

export type TurnStatus = 'your-turn' | 'waiting' | 'passed' | 'paused';

export interface TurnStatusCardProps {
  status: TurnStatus;
  playerName?: string;
  message?: string;
  className?: string;
}

const statusConfig: Record<TurnStatus, {
  icon: string;
  title: string;
  defaultMessage: string;
  bgClass: string;
  textClass: string;
  animate?: boolean;
}> = {
  'your-turn': {
    icon: '🎯',
    title: 'YOUR TURN',
    defaultMessage: 'Take your action!',
    bgClass: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    textClass: 'text-white',
    animate: true,
  },
  'waiting': {
    icon: '⏳',
    title: 'WAITING',
    defaultMessage: 'Another player is taking their turn',
    bgClass: 'bg-gray-700',
    textClass: 'text-gray-200',
  },
  'passed': {
    icon: '✓',
    title: 'PASSED',
    defaultMessage: 'You have passed for this round',
    bgClass: 'bg-gradient-to-br from-amber-500 to-orange-600',
    textClass: 'text-white',
  },
  'paused': {
    icon: '⏸',
    title: 'GAME PAUSED',
    defaultMessage: 'Waiting for strategy card selection',
    bgClass: 'bg-gradient-to-br from-amber-500 to-amber-600',
    textClass: 'text-white',
  },
};

export function TurnStatusCard({
  status,
  playerName,
  message,
  className,
}: TurnStatusCardProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'rounded-2xl p-6 text-center shadow-lg',
        config.bgClass,
        config.textClass,
        config.animate && 'animate-pulse-ready',
        className
      )}
    >
      <div className="text-4xl mb-2">{config.icon}</div>
      <div className="text-2xl font-bold mb-1">{config.title}</div>
      {playerName && status === 'waiting' && (
        <div className="text-lg opacity-90 mb-1">
          {playerName}&apos;s turn
        </div>
      )}
      <div className="text-sm opacity-80">
        {message || config.defaultMessage}
      </div>
    </div>
  );
}
