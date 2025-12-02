/**
 * Color Design Tokens
 *
 * Centralized color definitions for the entire application.
 * Change theme colors here to rebrand the app.
 */

// ============================================================================
// THEME COLORS (Configurable)
// ============================================================================

export const themeColors = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  accent: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },
} as const;

// ============================================================================
// SEMANTIC COLORS
// ============================================================================

export const semanticColors = {
  success: {
    light: '#86efac',
    DEFAULT: '#22c55e',
    dark: '#15803d',
  },
  warning: {
    light: '#fdba74',
    DEFAULT: '#f97316',
    dark: '#c2410c',
  },
  error: {
    light: '#fca5a5',
    DEFAULT: '#ef4444',
    dark: '#b91c1c',
  },
  info: {
    light: '#93c5fd',
    DEFAULT: '#3b82f6',
    dark: '#1d4ed8',
  },
} as const;

// ============================================================================
// NEUTRAL COLORS
// ============================================================================

export const neutralColors = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a',
} as const;

// ============================================================================
// PLAYER COLORS (TI4 Specific - Do not modify)
// ============================================================================

export type PlayerColorId = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'black' | 'orange' | 'pink';

export interface PlayerColorConfig {
  id: PlayerColorId;
  name: string;
  bg: string;
  text: string;
  border: string;
  hex: string;
  glow: string;
}

export const PLAYER_COLORS: Record<PlayerColorId, PlayerColorConfig> = {
  red: {
    id: 'red',
    name: 'Red',
    bg: 'bg-red-600',
    text: 'text-white',
    border: 'border-red-600',
    hex: '#dc2626',
    glow: 'shadow-red-500/50',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    bg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-blue-600',
    hex: '#2563eb',
    glow: 'shadow-blue-500/50',
  },
  green: {
    id: 'green',
    name: 'Green',
    bg: 'bg-green-600',
    text: 'text-white',
    border: 'border-green-600',
    hex: '#16a34a',
    glow: 'shadow-green-500/50',
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    bg: 'bg-yellow-500',
    text: 'text-black',
    border: 'border-yellow-500',
    hex: '#eab308',
    glow: 'shadow-yellow-500/50',
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    bg: 'bg-purple-600',
    text: 'text-white',
    border: 'border-purple-600',
    hex: '#9333ea',
    glow: 'shadow-purple-500/50',
  },
  black: {
    id: 'black',
    name: 'Black',
    bg: 'bg-gray-900',
    text: 'text-white',
    border: 'border-gray-700',
    hex: '#171717',
    glow: 'shadow-gray-500/50',
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    bg: 'bg-orange-600',
    text: 'text-white',
    border: 'border-orange-600',
    hex: '#ea580c',
    glow: 'shadow-orange-500/50',
  },
  pink: {
    id: 'pink',
    name: 'Pink',
    bg: 'bg-pink-600',
    text: 'text-white',
    border: 'border-pink-600',
    hex: '#db2777',
    glow: 'shadow-pink-500/50',
  },
} as const;

export const PLAYER_COLOR_LIST = Object.values(PLAYER_COLORS);

export function getPlayerColor(id: string): PlayerColorConfig {
  return PLAYER_COLORS[id as PlayerColorId] || PLAYER_COLORS.purple;
}
