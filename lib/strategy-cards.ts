import {
  Crown,
  Handshake,
  ScrollText,
  Hammer,
  Coins,
  Swords,
  FlaskConical,
  Castle,
  type LucideIcon,
} from 'lucide-react';

export interface StrategyCard {
  number: number;
  name: string;
  color: string;
  gradient: string;
  glow: string;
  Icon: LucideIcon;
}

export const STRATEGY_CARDS: readonly StrategyCard[] = [
  {
    number: 1,
    name: 'Leadership',
    color: 'bg-purple-600',
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
    glow: 'shadow-purple-500/50',
    Icon: Crown,
  },
  {
    number: 2,
    name: 'Diplomacy',
    color: 'bg-blue-600',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
    glow: 'shadow-blue-500/50',
    Icon: Handshake,
  },
  {
    number: 3,
    name: 'Politics',
    color: 'bg-green-600',
    gradient: 'bg-gradient-to-br from-green-500 to-green-700',
    glow: 'shadow-green-500/50',
    Icon: ScrollText,
  },
  {
    number: 4,
    name: 'Construction',
    color: 'bg-yellow-500',
    gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    glow: 'shadow-yellow-500/50',
    Icon: Hammer,
  },
  {
    number: 5,
    name: 'Trade',
    color: 'bg-orange-600',
    gradient: 'bg-gradient-to-br from-orange-500 to-orange-700',
    glow: 'shadow-orange-500/50',
    Icon: Coins,
  },
  {
    number: 6,
    name: 'Warfare',
    color: 'bg-red-600',
    gradient: 'bg-gradient-to-br from-red-500 to-red-700',
    glow: 'shadow-red-500/50',
    Icon: Swords,
  },
  {
    number: 7,
    name: 'Technology',
    color: 'bg-teal-600',
    gradient: 'bg-gradient-to-br from-teal-500 to-teal-700',
    glow: 'shadow-teal-500/50',
    Icon: FlaskConical,
  },
  {
    number: 8,
    name: 'Imperial',
    color: 'bg-pink-600',
    gradient: 'bg-gradient-to-br from-pink-500 to-pink-700',
    glow: 'shadow-pink-500/50',
    Icon: Castle,
  },
] as const;

export function getStrategyCard(number: number): StrategyCard | undefined {
  return STRATEGY_CARDS.find((card) => card.number === number);
}

export function getStrategyCardName(number: number): string {
  return getStrategyCard(number)?.name || `Card ${number}`;
}

export function getStrategyCardColor(number: number): string {
  return getStrategyCard(number)?.color || 'bg-gray-600';
}

export function getStrategyCardGradient(number: number): string {
  return getStrategyCard(number)?.gradient || 'bg-gradient-to-br from-gray-500 to-gray-700';
}

export function getStrategyCardGlow(number: number): string {
  return getStrategyCard(number)?.glow || 'shadow-gray-500/50';
}

export function getStrategyCardIcon(number: number): LucideIcon | null {
  return getStrategyCard(number)?.Icon || null;
}
