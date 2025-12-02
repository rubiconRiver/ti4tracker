# TI4 Tracker Design System

> A comprehensive design system for the Twilight Imperium 4 game tracker application.

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design Tokens](#design-tokens)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Components](#components)
7. [Animations](#animations)
8. [Page Templates](#page-templates)
9. [Implementation Plan](#implementation-plan)

---

## Design Philosophy

### Core Principles

1. **Space Opera Aesthetic**: TI4 is a grand space civilization game. The UI should feel epic, futuristic, and slightly dramatic without being gaudy.

2. **Dark-First Design**: Primary interface uses dark themes to:
   - Reduce eye strain during long game sessions (6-12 hours)
   - Create dramatic contrast for player colors
   - Feel more "command center" / sci-fi

3. **TV-Optimized**: The main display is designed for large screens (TV). Text must be readable from across a room. Touch targets must be large.

4. **Mobile-Friendly Controls**: Player controls on mobile must have large touch targets and be usable with one hand.

5. **Color as Identity**: Player colors and strategy card colors are sacred. They must be vibrant and immediately recognizable.

6. **Progressive Disclosure**: Show essential information prominently, reveal details on interaction.

7. **Consistency**: Same patterns everywhere. A button should look like a button across all pages.

---

## Design Tokens

Design tokens are the atomic values that make up our design system. They should be defined once and referenced everywhere.

### Token Categories

```
tokens/
├── colors.ts       # All color definitions
├── spacing.ts      # Spacing scale
├── typography.ts   # Font sizes, weights, families
├── shadows.ts      # Box shadows and glows
├── borders.ts      # Border radii, widths
├── animations.ts   # Timing, easing, keyframes
└── index.ts        # Unified export
```

---

## Color System

### Base Palette

#### Neutral (Gray Scale)
Used for backgrounds, borders, and text.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `neutral.950` | `#0a0a0a` | `gray-950` | Darkest background |
| `neutral.900` | `#171717` | `gray-900` | Primary dark bg |
| `neutral.800` | `#262626` | `gray-800` | Card backgrounds |
| `neutral.700` | `#404040` | `gray-700` | Elevated surfaces |
| `neutral.600` | `#525252` | `gray-600` | Borders, dividers |
| `neutral.500` | `#737373` | `gray-500` | Placeholder text |
| `neutral.400` | `#a3a3a3` | `gray-400` | Secondary text |
| `neutral.300` | `#d4d4d4` | `gray-300` | Tertiary text |
| `neutral.200` | `#e5e5e5` | `gray-200` | Light borders |
| `neutral.100` | `#f5f5f5` | `gray-100` | Light backgrounds |
| `neutral.50` | `#fafafa` | `gray-50` | Lightest bg |

#### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `success` | `#22c55e` (green-500) | Positive actions, active states |
| `warning` | `#f97316` (orange-500) | Caution, pass states |
| `error` | `#ef4444` (red-500) | Destructive actions |
| `info` | `#3b82f6` (blue-500) | Informational |

### Theme Colors (Configurable)

These are the **configurable brand colors** that can be swapped to theme the entire application for different projects or branding needs.

#### Primary Color
The main brand color. Used for primary actions, key interactive elements, and brand identity.

| Token | Default Value | Tailwind | CSS Variable |
|-------|---------------|----------|--------------|
| `primary.50` | `#f0fdf4` | `emerald-50` | `--color-primary-50` |
| `primary.100` | `#dcfce7` | `emerald-100` | `--color-primary-100` |
| `primary.200` | `#bbf7d0` | `emerald-200` | `--color-primary-200` |
| `primary.300` | `#86efac` | `emerald-300` | `--color-primary-300` |
| `primary.400` | `#4ade80` | `emerald-400` | `--color-primary-400` |
| `primary.500` | `#22c55e` | `emerald-500` | `--color-primary-500` |
| `primary.600` | `#16a34a` | `emerald-600` | `--color-primary-600` |
| `primary.700` | `#15803d` | `emerald-700` | `--color-primary-700` |
| `primary.800` | `#166534` | `emerald-800` | `--color-primary-800` |
| `primary.900` | `#14532d` | `emerald-900` | `--color-primary-900` |
| `primary.950` | `#052e16` | `emerald-950` | `--color-primary-950` |

**Usage:**
- Primary buttons (`bg-primary-600 hover:bg-primary-500`)
- Active states
- Links
- Focus rings
- Progress indicators
- Success states (when appropriate)

#### Secondary Color
Supporting brand color for secondary actions and accents.

| Token | Default Value | Tailwind | CSS Variable |
|-------|---------------|----------|--------------|
| `secondary.50` | `#eff6ff` | `blue-50` | `--color-secondary-50` |
| `secondary.100` | `#dbeafe` | `blue-100` | `--color-secondary-100` |
| `secondary.200` | `#bfdbfe` | `blue-200` | `--color-secondary-200` |
| `secondary.300` | `#93c5fd` | `blue-300` | `--color-secondary-300` |
| `secondary.400` | `#60a5fa` | `blue-400` | `--color-secondary-400` |
| `secondary.500` | `#3b82f6` | `blue-500` | `--color-secondary-500` |
| `secondary.600` | `#2563eb` | `blue-600` | `--color-secondary-600` |
| `secondary.700` | `#1d4ed8` | `blue-700` | `--color-secondary-700` |
| `secondary.800` | `#1e40af` | `blue-800` | `--color-secondary-800` |
| `secondary.900` | `#1e3a8a` | `blue-900` | `--color-secondary-900` |
| `secondary.950` | `#172554` | `blue-950` | `--color-secondary-950` |

**Usage:**
- Secondary buttons
- Info states
- Alternative CTAs
- Navigation highlights

#### Accent Color
A vibrant highlight color for special emphasis and decorative elements.

| Token | Default Value | Tailwind | CSS Variable |
|-------|---------------|----------|--------------|
| `accent.50` | `#fefce8` | `yellow-50` | `--color-accent-50` |
| `accent.100` | `#fef9c3` | `yellow-100` | `--color-accent-100` |
| `accent.200` | `#fef08a` | `yellow-200` | `--color-accent-200` |
| `accent.300` | `#fde047` | `yellow-300` | `--color-accent-300` |
| `accent.400` | `#facc15` | `yellow-400` | `--color-accent-400` |
| `accent.500` | `#eab308` | `yellow-500` | `--color-accent-500` |
| `accent.600` | `#ca8a04` | `yellow-600` | `--color-accent-600` |
| `accent.700` | `#a16207` | `yellow-700` | `--color-accent-700` |
| `accent.800` | `#854d0e` | `yellow-800` | `--color-accent-800` |
| `accent.900` | `#713f12` | `yellow-900` | `--color-accent-900` |
| `accent.950` | `#422006` | `yellow-950` | `--color-accent-950` |

**Usage:**
- Speaker indicator (TI4-specific)
- Special highlights
- Badges and tags
- Notification dots
- Premium/featured elements

#### Theme Configuration

To change the theme colors for a different project, update the values in:

```typescript
// lib/design-system/tokens/colors.ts

export const themeColors = {
  primary: {
    // Change these to your brand color (e.g., swap emerald for indigo)
    50: '#f0fdf4',
    100: '#dcfce7',
    // ... etc
  },
  secondary: {
    // Change these to your secondary brand color
    50: '#eff6ff',
    // ... etc
  },
  accent: {
    // Change these to your accent color
    50: '#fefce8',
    // ... etc
  },
};
```

And update CSS variables in `globals.css`:

```css
:root {
  --color-primary-500: #22c55e;
  --color-primary-600: #16a34a;
  --color-secondary-500: #3b82f6;
  --color-secondary-600: #2563eb;
  --color-accent-500: #eab308;
  /* ... full scale */
}
```

#### Alternative Theme Examples

**Corporate Blue Theme:**
```typescript
primary: blue     // #3b82f6
secondary: slate  // #64748b
accent: amber     // #f59e0b
```

**Luxury Purple Theme:**
```typescript
primary: violet   // #8b5cf6
secondary: slate  // #64748b
accent: gold      // #eab308
```

**Nature Green Theme (Default for TI4):**
```typescript
primary: emerald  // #22c55e
secondary: blue   // #3b82f6
accent: yellow    // #eab308
```

**Energetic Orange Theme:**
```typescript
primary: orange   // #f97316
secondary: cyan   // #06b6d4
accent: lime      // #84cc16
```

### Player Colors

The 8 TI4 player colors. These are **immutable** and critical for game identity.

| ID | Name | Background | Text | Border | Glow |
|----|------|------------|------|--------|------|
| `red` | Red | `#dc2626` | white | `#dc2626` | `rgba(220,38,38,0.5)` |
| `blue` | Blue | `#2563eb` | white | `#2563eb` | `rgba(37,99,235,0.5)` |
| `green` | Green | `#16a34a` | white | `#16a34a` | `rgba(22,163,74,0.5)` |
| `yellow` | Yellow | `#eab308` | black | `#eab308` | `rgba(234,179,8,0.5)` |
| `purple` | Purple | `#9333ea` | white | `#9333ea` | `rgba(147,51,234,0.5)` |
| `black` | Black | `#171717` | white | `#525252` | `rgba(82,82,82,0.5)` |
| `orange` | Orange | `#ea580c` | white | `#ea580c` | `rgba(234,88,12,0.5)` |
| `pink` | Pink | `#db2777` | white | `#db2777` | `rgba(219,39,119,0.5)` |

### Strategy Card Colors

Each of the 8 strategy cards has a distinct color identity.

| # | Name | Solid | Gradient From | Gradient To | Icon |
|---|------|-------|---------------|-------------|------|
| 1 | Leadership | purple-600 | purple-500 | purple-700 | 👑 |
| 2 | Diplomacy | blue-600 | blue-500 | blue-700 | 🤝 |
| 3 | Politics | green-600 | green-500 | green-700 | 📜 |
| 4 | Construction | yellow-500 | yellow-400 | yellow-600 | 🏗️ |
| 5 | Trade | orange-600 | orange-500 | orange-700 | 💰 |
| 6 | Warfare | red-600 | red-500 | red-700 | ⚔️ |
| 7 | Technology | teal-600 | teal-500 | teal-700 | 🔬 |
| 8 | Imperial | pink-600 | pink-500 | pink-700 | 🏛️ |

### Theme Modes

#### Dark Theme (Default)
- Background: `neutral.900`
- Surface: `neutral.800`
- Elevated: `neutral.700`
- Text Primary: `white`
- Text Secondary: `neutral.400`
- Border: `neutral.600`

#### Light Theme (Legacy - Admin panels)
- Background: `neutral.50`
- Surface: `white`
- Text Primary: `neutral.900`
- Text Secondary: `neutral.600`
- Border: `neutral.300`

**Decision**: Migrate ALL pages to dark theme for consistency.

---

## Typography

### Font Stack

```css
font-family:
  'Inter',           /* Primary - clean, modern */
  system-ui,
  -apple-system,
  sans-serif;

font-family-mono:
  'JetBrains Mono',  /* For timers/numbers */
  ui-monospace,
  monospace;
```

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `display-xl` | 96px (6rem) | 1 | 700 | Hero numbers (TV timer) |
| `display-lg` | 72px (4.5rem) | 1.1 | 700 | Current player name (TV) |
| `display-md` | 48px (3rem) | 1.2 | 600 | Large headings |
| `display-sm` | 36px (2.25rem) | 1.2 | 600 | Section headings |
| `heading-xl` | 30px (1.875rem) | 1.3 | 600 | Page titles |
| `heading-lg` | 24px (1.5rem) | 1.3 | 600 | Card titles |
| `heading-md` | 20px (1.25rem) | 1.4 | 600 | Subsection titles |
| `heading-sm` | 18px (1.125rem) | 1.4 | 500 | Small headings |
| `body-lg` | 18px (1.125rem) | 1.5 | 400 | Large body text |
| `body-md` | 16px (1rem) | 1.5 | 400 | Default body |
| `body-sm` | 14px (0.875rem) | 1.5 | 400 | Secondary text |
| `caption` | 12px (0.75rem) | 1.4 | 400 | Labels, hints |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `regular` | 400 | Body text |
| `medium` | 500 | Emphasized text, buttons |
| `semibold` | 600 | Headings |
| `bold` | 700 | Strong emphasis, display |

---

## Spacing & Layout

### Spacing Scale

Based on 4px grid system.

| Token | Value | Tailwind |
|-------|-------|----------|
| `0` | 0 | `0` |
| `1` | 4px | `1` |
| `2` | 8px | `2` |
| `3` | 12px | `3` |
| `4` | 16px | `4` |
| `5` | 20px | `5` |
| `6` | 24px | `6` |
| `8` | 32px | `8` |
| `10` | 40px | `10` |
| `12` | 48px | `12` |
| `16` | 64px | `16` |
| `20` | 80px | `20` |
| `24` | 96px | `24` |

### Container Widths

| Token | Value | Usage |
|-------|-------|-------|
| `container.sm` | 640px | Small forms, modals |
| `container.md` | 768px | Medium content |
| `container.lg` | 1024px | Standard pages |
| `container.xl` | 1280px | Wide layouts |
| `container.2xl` | 1536px | Admin panels |
| `container.full` | 100% | TV display |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius.sm` | 4px | Small elements, tags |
| `radius.md` | 8px | Buttons, inputs |
| `radius.lg` | 12px | Cards |
| `radius.xl` | 16px | Large cards, panels |
| `radius.2xl` | 24px | Hero sections |
| `radius.full` | 9999px | Circles, pills |

### Breakpoints

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |
| `tv` | 1920px | TV displays |

---

## Components

### Button

#### Variants

| Variant | Usage | Appearance |
|---------|-------|------------|
| `primary` | Main actions | Green gradient, white text |
| `secondary` | Alternative actions | Blue solid, white text |
| `ghost` | Tertiary actions | Transparent, border on hover |
| `danger` | Destructive actions | Red solid, white text |
| `player` | Player-specific buttons | Player color bg |

#### Sizes

| Size | Padding | Font Size | Min Height |
|------|---------|-----------|------------|
| `sm` | 8px 16px | 14px | 32px |
| `md` | 12px 24px | 16px | 44px |
| `lg` | 16px 32px | 18px | 56px |
| `xl` | 20px 40px | 20px | 64px |

#### States

- **Default**: Base appearance
- **Hover**: Slight lighten, subtle scale (1.02)
- **Active**: Darken, scale down (0.98)
- **Disabled**: 50% opacity, no pointer events
- **Loading**: Spinner icon, disabled state

#### Specification

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'player';
  size: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  playerColor?: PlayerColor; // Only for variant="player"
  children: ReactNode;
  onClick?: () => void;
}
```

### Card

#### Variants

| Variant | Usage | Appearance |
|---------|-------|------------|
| `default` | Standard content | Dark bg, subtle border |
| `elevated` | Prominent content | Lighter bg, shadow |
| `outlined` | Clickable cards | Border emphasis |
| `glass` | Overlay content | Semi-transparent, blur |
| `player` | Player info | Left color accent |

#### Specification

```tsx
interface CardProps {
  variant: 'default' | 'elevated' | 'outlined' | 'glass' | 'player';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  playerColor?: PlayerColor; // Only for variant="player"
  glow?: boolean; // Animated glow effect
  interactive?: boolean; // Hover/click states
  children: ReactNode;
}
```

### Input

#### Types

- Text input
- Number input
- Select dropdown
- Textarea

#### Specification

```tsx
interface InputProps {
  type: 'text' | 'number' | 'email';
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}
```

### Badge

For status indicators, counts, labels.

#### Variants

| Variant | Usage |
|---------|-------|
| `default` | Neutral info |
| `success` | Active, online, complete |
| `warning` | Paused, pending |
| `error` | Failed, error |
| `player` | Player-colored |
| `strategy` | Strategy card colored |

### Avatar

Player/faction representation.

#### Specification

```tsx
interface AvatarProps {
  size: 'sm' | 'md' | 'lg' | 'xl';
  playerColor: PlayerColor;
  faction?: string; // Shows faction icon if available
  fallback?: string; // Initials or text
  speaker?: boolean; // Shows speaker indicator
}
```

### StrategyCard

Display for strategy cards.

#### Variants

| Variant | Usage |
|---------|-------|
| `full` | Large display with all info |
| `compact` | Small badge-like display |
| `selectable` | Interactive selection state |

#### Specification

```tsx
interface StrategyCardProps {
  cardNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  variant: 'full' | 'compact' | 'selectable';
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}
```

### PlayerCard

Complete player information display.

#### Specification

```tsx
interface PlayerCardProps {
  player: {
    name: string;
    color: PlayerColor;
    faction?: string;
    score: number;
    totalTime: number;
    strategyCard?: number;
    hasSpeaker: boolean;
    hasPassed: boolean;
  };
  variant: 'compact' | 'expanded' | 'tv';
  isActive?: boolean;
  showTimer?: boolean;
}
```

### Timer

Time display component.

#### Specification

```tsx
interface TimerProps {
  milliseconds: number;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'display';
  showHours?: boolean;
  pulse?: boolean; // Animated pulse when active
}
```

### ProgressIndicator

Shows completion progress.

#### Variants

- `dots`: Row of filled/unfilled dots
- `bar`: Horizontal progress bar
- `ring`: Circular progress

### Modal

Overlay dialogs.

#### Specification

```tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size: 'sm' | 'md' | 'lg';
  children: ReactNode;
  footer?: ReactNode;
}
```

### Toast

Notification messages.

#### Variants

- `success`
- `error`
- `warning`
- `info`

---

## Animations

### Timing

| Token | Value | Usage |
|-------|-------|-------|
| `instant` | 0ms | No animation |
| `fast` | 150ms | Micro-interactions |
| `normal` | 300ms | Standard transitions |
| `slow` | 500ms | Emphasis animations |
| `slower` | 700ms | Dramatic reveals |

### Easing

| Token | Value | Usage |
|-------|-------|-------|
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Moving elements |
| `bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful emphasis |

### Keyframe Animations

#### `slideUp`
Element slides up while fading in.
```css
from { transform: translateY(20px); opacity: 0; }
to { transform: translateY(0); opacity: 1; }
```

#### `slideDown`
Element slides down while fading in.

#### `fadeIn`
Simple opacity fade.

#### `scaleIn`
Scale from 95% to 100% with fade.

#### `glow`
Pulsing glow effect for emphasis.
```css
0%, 100% { box-shadow: 0 0 15px var(--glow-color); }
50% { box-shadow: 0 0 30px var(--glow-color); }
```

#### `pulse`
Subtle scale pulse for attention.
```css
0%, 100% { transform: scale(1); }
50% { transform: scale(1.02); }
```

#### `spin`
360-degree rotation for loading.

---

## Page Templates

### TV Display Template

The primary game view for large screens.

```
┌─────────────────────────────────────────────────┐
│ Header: Logo | Round X | Admin Link | Join Link │
├─────────────────────────────────────────────────┤
│                                                 │
│              CURRENT PLAYER AREA                │
│        (Large name, faction, turn timer)        │
│              [End Turn] [Pass]                  │
│                                                 │
├─────────────────────────────────────────────────┤
│ Player 1  │ Player 2  │ Player 3  │ Player 4   │
│ Card      │ Card      │ Card      │ Card       │
├───────────┼───────────┼───────────┼────────────┤
│ Player 5  │ Player 6  │ Player 7  │ Player 8   │
│ Card      │ Card      │ Card      │ Card       │
└─────────────────────────────────────────────────┘
```

### Strategy Selection Template

Shown when game is paused for card selection.

```
┌─────────────────────────────────────────────────┐
│ Header                                          │
├─────────────────────────────────────────────────┤
│     ┌─────────────────────────────────────┐     │
│     │  Strategy Selection - Round X       │     │
│     │  Progress: ●●●○○○ (3/6)            │     │
│     │                                     │     │
│     │  👑 Speaker: Player Name            │     │
│     │                                     │     │
│     │  ┌─────────┐ ┌─────────┐           │     │
│     │  │Player 1 │ │Player 2 │           │     │
│     │  │[Card]   │ │[Tap]    │           │     │
│     │  └─────────┘ └─────────┘           │     │
│     │  ┌─────────┐ ┌─────────┐           │     │
│     │  │Player 3 │ │Player 4 │           │     │
│     │  │[Card]   │ │[Tap]    │           │     │
│     │  └─────────┘ └─────────┘           │     │
│     │                                     │     │
│     │  [ 🚀 Start Round X ]              │     │
│     └─────────────────────────────────────┘     │
│                                                 │
│        (Player grid still visible below)        │
└─────────────────────────────────────────────────┘
```

### Mobile Player Template

For players on their phones.

```
┌─────────────────────┐
│ TI4 Tracker         │
│ Round 3             │
├─────────────────────┤
│ Select Your Player  │
│                     │
│ ┌─────────────────┐ │
│ │ 🔴 Player 1     │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 🔵 Player 2     │ │
│ └─────────────────┘ │
│ ...                 │
├─────────────────────┤
│                     │
│ Selected: Player 1  │
│ Faction: Xxcha      │
│ Score: 4 pts        │
│                     │
│ ┌─────────────────┐ │
│ │   YOUR TURN!    │ │
│ │   🟢            │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│ [  End Turn  ][Pass]│
└─────────────────────┘
```

### Admin Panel Template

Control interface for game manager.

```
┌─────────────────────────────────────────────────┐
│ Admin Panel - Game Name                         │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌──────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ QR Code  │ │ Game Controls│ │ Scores       │ │
│ │          │ │              │ │              │ │
│ │          │ │ Status: ●    │ │ P1: [4] +/-  │ │
│ │          │ │ Round: 3     │ │ P2: [6] +/-  │ │
│ │          │ │ Turn: 12     │ │ P3: [2] +/-  │ │
│ │          │ │              │ │ P4: [5] +/-  │ │
│ │          │ │ [Pause]      │ │              │ │
│ │          │ │ [Next Round] │ │              │ │
│ │          │ │ [Rewind]     │ │              │ │
│ └──────────┘ └──────────────┘ └──────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Strategy Card Assignment                    │ │
│ │ (Full component)                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Recent Actions                              │ │
│ │ • Player 1 ended turn (2:34)               │ │
│ │ • Player 2 passed                          │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Game Setup Template

New game creation flow.

```
┌─────────────────────────────────────────────────┐
│              Create New Game                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Add Players                             │   │
│  │                                         │   │
│  │ Player 1                                │   │
│  │ [Name Input    ] [Color] [Faction ▼]   │   │
│  │                                         │   │
│  │ Player 2                                │   │
│  │ [Name Input    ] [Color] [Faction ▼]   │   │
│  │                                         │   │
│  │ [+ Add Player]                          │   │
│  │                                         │   │
│  │ ─────────────────────────────────────   │   │
│  │                                         │   │
│  │ Speaker: [Player 1 ▼]                   │   │
│  │                                         │   │
│  │ [     Create Game     ]                 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Foundation (Design Tokens)

Create the core token system that everything builds upon.

**Files to create:**
```
lib/design-system/
├── tokens/
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   ├── shadows.ts
│   ├── borders.ts
│   ├── animations.ts
│   └── index.ts
├── utils/
│   ├── cn.ts              # className utility (clsx + twMerge)
│   └── player-colors.ts   # Player color utilities
└── index.ts
```

**Tasks:**
1. Install dependencies: `clsx`, `tailwind-merge`
2. Create color token definitions
3. Create spacing/typography tokens
4. Create animation tokens
5. Set up className utility function
6. Consolidate player colors (remove duplicates)
7. Update `tailwind.config.ts` with design tokens

### Phase 2: Core Components

Build the foundational reusable components.

**Files to create:**
```
components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── select.tsx
├── badge.tsx
├── avatar.tsx
├── timer.tsx
├── progress.tsx
├── modal.tsx
├── toast.tsx
└── index.ts
```

**Priority order:**
1. Button (used everywhere)
2. Card (used everywhere)
3. Input/Select (forms)
4. Badge (status indicators)
5. Avatar (player identity)
6. Timer (game-specific)
7. Progress (game-specific)
8. Modal (confirmations)
9. Toast (notifications)

### Phase 3: Game Components

Build TI4-specific compound components.

**Files to create:**
```
components/game/
├── strategy-card.tsx
├── player-card.tsx
├── player-avatar.tsx
├── speaker-banner.tsx
├── turn-indicator.tsx
├── game-header.tsx
├── player-grid.tsx
└── index.ts
```

### Phase 4: Page Migration

Update all pages to use the new component library.

**Pages to update:**
1. `/` - Home page
2. `/game/new` - Game creation
3. `/game/[id]` - TV display
4. `/game/[id]/admin` - Admin panel
5. `/game/[id]/join` - Mobile player view

**For each page:**
- Replace inline styles with components
- Apply consistent dark theme
- Ensure responsive behavior
- Add proper animations

### Phase 5: Polish & Documentation

Final touches and developer documentation.

**Tasks:**
1. Add Storybook (optional) for component docs
2. Write component usage documentation
3. Ensure accessibility (ARIA labels, focus states)
4. Performance audit
5. Cross-browser testing

---

## File Structure (Final)

```
ti4tracker/
├── app/
│   ├── globals.css           # Global styles + animations
│   ├── page.tsx              # Home
│   └── game/
│       ├── new/page.tsx      # Game creation
│       └── [id]/
│           ├── page.tsx      # TV display
│           ├── admin/page.tsx
│           └── join/page.tsx
├── components/
│   ├── ui/                   # Design system components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── timer.tsx
│   │   ├── progress.tsx
│   │   ├── modal.tsx
│   │   ├── toast.tsx
│   │   └── index.ts
│   └── game/                 # Game-specific components
│       ├── strategy-card.tsx
│       ├── strategy-card-assignment.tsx
│       ├── player-card.tsx
│       ├── player-avatar.tsx
│       ├── speaker-banner.tsx
│       ├── turn-indicator.tsx
│       ├── game-header.tsx
│       ├── player-grid.tsx
│       ├── use-game-polling.tsx
│       ├── use-game-socket.tsx
│       └── index.ts
├── lib/
│   ├── design-system/
│   │   ├── tokens/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   ├── typography.ts
│   │   │   ├── shadows.ts
│   │   │   ├── borders.ts
│   │   │   ├── animations.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   └── player-colors.ts
│   │   └── index.ts
│   ├── strategy-cards.ts
│   └── factions.ts
└── docs/
    └── DESIGN-SYSTEM.md
```

---

## Success Criteria

- [ ] All color usage comes from design tokens
- [ ] No duplicate COLOR_MAP definitions
- [ ] All buttons use `<Button>` component
- [ ] All cards use `<Card>` component
- [ ] All inputs use `<Input>` or `<Select>` component
- [ ] All pages use dark theme consistently
- [ ] Components have proper TypeScript types
- [ ] Animations are smooth and consistent
- [ ] Mobile touch targets are ≥44px
- [ ] TV text is readable from 10 feet away
- [ ] No hardcoded Tailwind classes for colors/spacing in pages
- [ ] All pages pass basic accessibility audit

---

## Notes

### Why Dark Theme Everywhere?

1. TI4 games last 6-12 hours. Dark themes reduce eye strain.
2. Player colors pop more against dark backgrounds.
3. Feels more "sci-fi command center" appropriate for TI4.
4. Consistent experience across all views.

### Why Not Use a UI Library (shadcn, etc)?

1. TI4 has very specific design needs (player colors, strategy cards).
2. We need full control over component internals.
3. Game-specific components (Timer, StrategyCard) wouldn't exist.
4. Smaller bundle size with only what we need.

### Accessibility Considerations

1. Color is never the only indicator (always include text/icons).
2. Focus states must be visible.
3. Touch targets ≥44px on mobile.
4. Text contrast ratios meet WCAG AA.
5. Screen reader labels where appropriate.

---

*Last updated: Design System v1.0*
