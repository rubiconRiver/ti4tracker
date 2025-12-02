# UI Design System Migration Plan

## Overview

Complete migration of all remaining pages to use the new design system components and dark theme.

---

## Phase 1: TV Display Page (`/game/[id]/page.tsx`)

### Current State
- Already uses dark theme (`bg-gray-900`)
- Has local `COLOR_MAP` that duplicates player colors
- Strategy card assignment component already modernized
- Inline button styles throughout

### Tasks

- [ ] **Remove local COLOR_MAP** - Import from `@/lib/design-system/tokens/colors`
- [ ] **Header buttons** - Swap "Admin Panel" and "Join Game" links to `<Button variant="secondary">`
- [ ] **Player cards in grid** - Convert to `<Card variant="player">` with proper props
- [ ] **End Turn button** - `<Button variant="primary" size="xl">`
- [ ] **Pass button** - `<Button variant="ghost">` with confirmation state
- [ ] **Pass confirmation** - Style with `<Card variant="glass">` inline
- [ ] **PASSED badge** - Create `<Badge>` component or style consistently
- [ ] **Speaker indicator** - Use accent color for speaker icon/glow

### New Components Needed
- `Badge` - For PASSED status, speaker indicator

---

## Phase 2: Admin Panel (`/game/[id]/admin/page.tsx`)

### Current State
- Light theme (`bg-gray-50`, white cards)
- Many different button colors (blue, green, orange, yellow, purple, red)
- QR code display section
- Score input fields
- Recent actions list
- Strategy card assignment (already modernized)

### Tasks

- [ ] **Convert to dark theme** - `bg-gray-900`, update all text colors
- [ ] **Remove local COLOR_MAP** - Import from design system
- [ ] **Header section** - Dark styling with proper hierarchy
- [ ] **QR Code card** - `<Card variant="elevated">` with dark bg
- [ ] **Game Controls card** - `<Card>` with proper button variants:
  - Status indicator → `<Badge variant="success|warning">`
  - Pause/Resume → `<Button variant="secondary">`
  - Pass Turn → `<Button variant="ghost">`
  - Rewind → `<Button variant="ghost">`
  - Next Round → `<Button variant="primary">`
  - Reset Turn → `<Button variant="danger">`
  - Reset Game → `<Button variant="danger">` with confirmation
- [ ] **Player Scores card** - `<Card>` with `<Input type="number">` components
- [ ] **Recent Actions card** - `<Card>` with styled list items
- [ ] **Strategy Card Assignment** - Already done, just ensure container matches

### New Components Needed
- `Badge` - For status indicators (Active/Paused)
- Possibly `NumberInput` - Specialized for score +/- controls

---

## Phase 3: Mobile Join Page (`/game/[id]/join/page.tsx`)

### Current State
- Light theme
- Player selection as large colored buttons
- Status card changes color based on state (green/orange/gray)
- Fixed bottom action bar

### Tasks

- [ ] **Convert to dark theme** - Full page dark
- [ ] **Remove local COLOR_MAP** - Import from design system
- [ ] **Header** - Sticky dark header with round info
- [ ] **Player selection grid** - Large `<Button variant="player">` buttons
- [ ] **Selected player info card** - `<Card variant="player">` with details
- [ ] **Turn status card** - Create `TurnStatus` component or use `<Card>` with conditional styling:
  - Your turn → Green glow, primary colors
  - Passed → Orange/amber styling
  - Waiting → Muted gray
  - Game paused → Amber with message
- [ ] **Fixed bottom bar** - Dark bg, proper button sizing for touch
  - End Turn → `<Button variant="primary" size="xl">`
  - Pass → `<Button variant="ghost" size="lg">`

### New Components Needed
- `TurnStatusCard` - Game-specific component for turn state display

---

## Phase 4: New Components to Build

### Badge Component
```tsx
interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'player';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  playerColor?: PlayerColorId;
  pulse?: boolean; // For animated badges
}
```

Uses:
- PASSED indicator on player cards
- Speaker badge
- Active/Paused status in admin
- Round/Turn counters

### TurnStatusCard Component
```tsx
interface TurnStatusCardProps {
  status: 'your-turn' | 'waiting' | 'passed' | 'paused';
  playerName?: string;
  message?: string;
}
```

Game-specific component for mobile view showing whose turn it is.

### Optional: ConfirmButton Component
```tsx
interface ConfirmButtonProps extends ButtonProps {
  confirmText: string;
  onConfirm: () => void;
}
```

Button that requires a second click to confirm (for Pass, Reset, etc.)

---

## Phase 5: Cleanup & Polish

### Remove Duplicated Code
- [ ] Delete all local `COLOR_MAP` definitions
- [ ] Delete all local `TI4_COLORS` definitions
- [ ] Ensure all pages import from `@/lib/design-system`

### Consistency Check
- [ ] All buttons use `<Button>` component
- [ ] All cards use `<Card>` component
- [ ] All inputs use `<Input>` or `<Select>` component
- [ ] All pages have dark theme
- [ ] Animations are consistent (slide-up, glow, pulse)

### Accessibility
- [ ] All interactive elements have focus states
- [ ] Color is not the only indicator (icons/text accompany colors)
- [ ] Touch targets are ≥44px on mobile

---

## Execution Order

1. **Build Badge component** (needed by multiple pages)
2. **Migrate TV Display** (smallest diff, already dark)
3. **Migrate Admin Panel** (most buttons, good component exercise)
4. **Build TurnStatusCard component** (needed by mobile)
5. **Migrate Mobile Join** (most complex state handling)
6. **Cleanup pass** (remove duplicates, consistency check)

---

## Files to Modify

```
components/ui/
├── badge.tsx              # NEW
├── confirm-button.tsx     # NEW (optional)
└── index.ts               # Update exports

components/game/
├── turn-status-card.tsx   # NEW
└── index.ts               # Update exports

app/game/[id]/
├── page.tsx               # MODIFY - TV Display
├── admin/page.tsx         # MODIFY - Admin Panel
└── join/page.tsx          # MODIFY - Mobile Join
```

---

## Success Criteria

When complete:
- [ ] All 5 pages use dark theme
- [ ] Zero local COLOR_MAP definitions remain
- [ ] All buttons are `<Button>` components
- [ ] All cards are `<Card>` components
- [ ] All form elements use UI components
- [ ] Consistent animation patterns
- [ ] Mobile touch targets are properly sized
- [ ] TV display text is readable from distance
