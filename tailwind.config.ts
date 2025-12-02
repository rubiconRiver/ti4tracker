import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Player colors (dynamic classes)
    'bg-red-600', 'border-red-600', 'text-red-600', 'shadow-red-500/50',
    'bg-blue-600', 'border-blue-600', 'text-blue-600', 'shadow-blue-500/50',
    'bg-green-600', 'border-green-600', 'text-green-600', 'shadow-green-500/50',
    'bg-yellow-500', 'border-yellow-500', 'text-yellow-500', 'shadow-yellow-500/50',
    'bg-purple-600', 'border-purple-600', 'text-purple-600', 'shadow-purple-500/50',
    'bg-gray-900', 'border-gray-700', 'shadow-gray-500/50',
    'bg-orange-600', 'border-orange-600', 'text-orange-600', 'shadow-orange-500/50',
    'bg-pink-600', 'border-pink-600', 'text-pink-600', 'shadow-pink-500/50',
    // Strategy card gradients
    'bg-gradient-to-br',
    'from-purple-500', 'to-purple-700',
    'from-blue-500', 'to-blue-700',
    'from-green-500', 'to-green-700',
    'from-yellow-400', 'to-yellow-600',
    'from-orange-500', 'to-orange-700',
    'from-red-500', 'to-red-700',
    'from-teal-500', 'to-teal-700',
    'from-pink-500', 'to-pink-700',
    'bg-teal-600',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Theme colors (configurable)
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
      },
      animation: {
        'card-glow': 'card-glow-pulse 2s ease-in-out infinite',
        'speaker-glow': 'speaker-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'pulse-ready': 'pulse-ready 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
