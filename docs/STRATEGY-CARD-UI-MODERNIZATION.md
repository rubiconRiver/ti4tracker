# Strategy Card UI Modernization Plan

## Current State Analysis

The current strategy card selection UI has several issues that make it look outdated:

### Visual Issues
1. **Theme Mismatch**: Uses white background (`bg-white`) which clashes with the dark (`bg-gray-900`) theme of the main game page
2. **Minimal Card Display**: Buttons only show numbers (1-8), not card names - users must memorize which number is which card
3. **Plain Layout**: Basic bordered boxes for player sections with no visual interest
4. **No Thematic Elements**: Doesn't feel like a TI4 game interface - very generic
5. **Basic Speaker Indicator**: Yellow background box doesn't stand out or feel special
6. **Small Click Targets**: 4-column grid creates small buttons that are hard to tap on TV displays
7. **No Visual Feedback**: Limited hover/selection states

### UX Issues
1. Cards need to show both number AND name clearly
2. Assigned cards should be more visually distinct
3. Player sections could show faction icons for quick identification
4. The submit button at the bottom gets lost

---

## Proposed Modernization

### 1. Dark Theme Integration
- Switch from white background to dark theme (`bg-gray-800/900`)
- Use glowing borders and subtle gradients for depth
- Add subtle backdrop blur effects for glass-morphism feel

### 2. Strategy Card Redesign
**Current**: Small colored buttons with just numbers
**New**: Larger card-style buttons showing:
- Card number prominently
- Card name visible
- Distinctive icon or symbol for each card
- Gradient backgrounds matching TI4 card colors
- Glow effect when selected
- Clear "taken" state when assigned to another player

**Layout Change**:
- 2-column layout on mobile, 4-column on larger screens
- Cards should be taller with more visual presence
- Consider a horizontal scrolling carousel on mobile

### 3. Player Section Redesign
**Current**: Plain bordered boxes with text
**New**:
- Dark cards with subtle borders
- Player color accent on left edge (colored stripe)
- Faction icon display if available
- Larger, clearer player name
- Show assigned card as a "mini card" display
- Speaker gets a special gold/yellow glow or crown icon

### 4. Speaker Highlight
**Current**: Basic yellow background box
**New**:
- Gold/amber glow effect around speaker section
- Crown or speaker icon
- "SPEAKER" badge with animation
- Speaker picks first - make this prominent

### 5. Submit Button Enhancement
**Current**: Basic green button at bottom
**New**:
- Larger, more prominent button
- Pulsing glow when all cards assigned
- Disabled state is clearly different
- "Start Round X" with round number

### 6. Animations & Micro-interactions
- Smooth transitions when selecting cards
- Card "flip" or "glow" animation on selection
- Subtle pulse on available cards
- Slide-in animation for the whole panel
- Progress indicator showing how many players have cards

---

## Implementation Files

### Primary Changes
| File | Changes |
|------|---------|
| `components/game/strategy-card-assignment.tsx` | Complete redesign of component |
| `lib/strategy-cards.ts` | Add icons/gradients for each card |
| `app/globals.css` | Add keyframe animations and custom classes |

### Secondary Changes (if needed)
| File | Changes |
|------|---------|
| `app/game/[id]/page.tsx` | Update container styling for strategy selection |
| `app/game/[id]/admin/page.tsx` | Ensure admin page also benefits from updates |

---

## Detailed Component Structure

```tsx
// New StrategyCardAssignment structure
<div className="strategy-selection-panel"> // Dark, glass-morphism container

  // Header with round info and progress
  <header>
    <h2>Strategy Selection - Round {n}</h2>
    <ProgressBar assigned={x} total={y} />
  </header>

  // Speaker callout (if applicable)
  <SpeakerBanner player={speaker} />

  // Player list with card selection
  <div className="player-grid">
    {players.map(player => (
      <PlayerCardSelector
        player={player}
        assignedCard={...}
        availableCards={...}
        onSelect={...}
      />
    ))}
  </div>

  // Start Round button
  <StartRoundButton
    enabled={allAssigned}
    round={currentRound}
  />
</div>
```

---

## Strategy Card Visual Design

Each card should have a distinct look:

| # | Card | Color Scheme | Suggested Icon |
|---|------|--------------|----------------|
| 1 | Leadership | Purple gradient | Crown/Star |
| 2 | Diplomacy | Blue gradient | Handshake/Globe |
| 3 | Politics | Green gradient | Vote/Scroll |
| 4 | Construction | Yellow/Gold | Hammer/Building |
| 5 | Trade | Orange gradient | Coins/Exchange |
| 6 | Warfare | Red gradient | Sword/Shield |
| 7 | Technology | Teal/Cyan | Circuit/Atom |
| 8 | Imperial | Pink/Magenta | Throne/Crown |

---

## CSS Animations to Add

```css
/* Suggested animations */
@keyframes card-glow {
  0%, 100% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 20px currentColor; }
}

@keyframes pulse-available {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

@keyframes slide-in {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes speaker-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(234, 179, 8, 0.5); }
  50% { box-shadow: 0 0 25px rgba(234, 179, 8, 0.8); }
}
```

---

## Implementation Steps

### Phase 1: Foundation
1. Update `strategy-cards.ts` with gradient classes and enhanced styling data
2. Add CSS animations to `globals.css`
3. Convert component to dark theme

### Phase 2: Card Redesign
4. Redesign card buttons to show name + number
5. Add selection glow and disabled states
6. Implement 2-4 column responsive grid

### Phase 3: Player Sections
7. Redesign player sections with color accents
8. Add faction icon integration
9. Implement speaker highlight with glow

### Phase 4: Polish
10. Add progress indicator
11. Enhance submit button
12. Add micro-animations
13. Test on different screen sizes (especially TV display)

---

## Success Criteria

- [ ] Component uses dark theme matching rest of app
- [ ] Cards display both number and name prominently
- [ ] Selected cards have clear visual distinction
- [ ] Taken cards are obviously unavailable
- [ ] Speaker is clearly highlighted
- [ ] Works well on large TV displays
- [ ] Smooth animations that don't feel janky
- [ ] Submit button is prominent and inviting
- [ ] Overall aesthetic feels "TI4-esque" - space/sci-fi vibe

---

## Notes

- Keep accessibility in mind - sufficient color contrast
- Test with 3-8 players to ensure layout scales
- Consider touch targets for TV remotes
- Don't over-animate - keep it performant
