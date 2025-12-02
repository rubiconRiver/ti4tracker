# Architectural Review

A thorough review of the codebase before public sharing.

---

## Critical Issues (Must Fix)

### 1. No Authentication or Authorization

**Problem:** Anyone with a game URL can access everything:
- Admin panel with full game controls
- Reset entire game, modify scores
- End anyone's turn

**Files affected:** All API routes, all pages

**Risk:** High - malicious users could disrupt games

**Fix:** Add simple authentication:
- Option A: PIN code per game (stored in DB, required for admin actions)
- Option B: Session-based admin token (generated on game creation)
- Option C: Simple password on admin page

### 2. No Input Validation on API Routes

**Problem:** API routes pass request body directly to Prisma without validation.

```typescript
// app/api/games/[id]/route.ts - DANGEROUS
const body = await request.json();
await db.game.update({
  where: { id },
  data: body,  // User can update ANY field!
});
```

**Risk:** Medium - could corrupt data, update fields that shouldn't be updatable

**Fix:** Use Zod or similar for input validation:
```typescript
const updateSchema = z.object({
  status: z.enum(['setup', 'active', 'paused', 'completed']).optional(),
  currentRound: z.number().int().positive().optional(),
  // ... only allow specific fields
});
```

### 3. Duplicate Type Definitions

**Problem:** `Player`, `Game`, `TurnHistory` interfaces defined 5+ times across files.

**Files:**
- `components/game/strategy-card-assignment.tsx`
- `app/game/new/page.tsx`
- `app/game/[id]/page.tsx`
- `app/game/[id]/join/page.tsx`
- `app/game/[id]/admin/page.tsx`

**Risk:** Low (code smell) - but will cause bugs when types diverge

**Fix:** Create shared types in `lib/types.ts`:
```typescript
// lib/types.ts
export interface Player {
  id: string;
  name: string;
  color: string;
  // ...
}

export interface Game {
  id: string;
  status: GameStatus;
  // ...
}
```

---

## Medium Issues (Should Fix)

### 4. Dead Code - Socket.io

**Problem:** `server.ts`, `lib/socket.ts`, and `use-game-socket.tsx` are dead code on Vercel.

**Files to remove:**
- `server.ts` (or keep for local dev only)
- `lib/socket.ts`
- `components/game/use-game-socket.tsx`

**Fix:** Remove or gate behind `NODE_ENV === 'development'`

### 5. No Rate Limiting

**Problem:** API endpoints have no rate limiting. Could be spammed.

**Risk:** Medium - DOS potential, database load

**Fix:**
- Use Vercel's built-in rate limiting (if on Pro plan)
- Or add simple in-memory rate limiting per IP
- Or use Upstash Redis rate limiter

### 6. Score Input Fires on Every Keystroke

**Problem:** In admin panel, score input calls API on every character typed.

```typescript
<input
  onChange={(e) => updateScore(player.id, parseInt(e.target.value) || 0)}
  // Typing "15" fires TWO API calls: one for "1", one for "15"
/>
```

**Fix:** Debounce or use `onBlur` instead:
```typescript
<input
  onBlur={(e) => updateScore(player.id, parseInt(e.target.value) || 0)}
/>
```

### 7. No Error Boundaries

**Problem:** Unhandled errors crash entire app.

**Fix:** Add React Error Boundary at page level.

### 8. Inconsistent Themes

**Problem:** Admin panel still uses light theme (bg-gray-50, bg-white) while rest of app is dark.

**Fix:** Migrate admin panel to dark theme using design system.

---

## Low Priority (Nice to Have)

### 9. No Tests

**Problem:** Zero test coverage.

**Future:** Add tests for:
- Critical API routes (turns, rounds)
- Game state transitions
- UI components

### 10. No Loading States on Actions

**Problem:** Clicking buttons gives no feedback until polling updates.

**Fix:** Already planned with optimistic updates.

### 11. Console Logs in Production

**Problem:** `console.log` statements throughout code.

**Files:** `server.ts`, `use-game-socket.tsx`, various error handlers

**Fix:** Remove or use proper logging library.

### 12. No Favicon/Metadata

**Problem:** Default Next.js favicon, missing OpenGraph tags.

**Fix:** Add proper branding for sharing.

---

## Architecture Diagram (Current)

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Home      │   New Game  │   TV View   │  Mobile Join     │
│   Page      │   Page      │   Page      │  Page            │
│             │             │             │  Admin Panel     │
├─────────────┴─────────────┴─────────────┴──────────────────┤
│                    useGamePolling (2s)                      │
│                    (fetches full game state)                │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL SERVERLESS                         │
├─────────────────────────────────────────────────────────────┤
│  /api/games          - CRUD games                           │
│  /api/games/[id]     - Get/Update game (NO VALIDATION!)     │
│  /api/players        - CRUD players (NO VALIDATION!)        │
│  /api/turns          - End turn, pass                       │
│  /api/rounds         - Start round with strategy cards      │
│  /api/rounds/next    - Advance to next round               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       POSTGRESQL                             │
│                    (via Prisma ORM)                         │
├─────────────────────────────────────────────────────────────┤
│  Game, Player, Round, TurnHistory, StrategyCardPick         │
└─────────────────────────────────────────────────────────────┘
```

---

## Recommended Fix Priority

### Before Sharing Publicly:

1. **Add admin PIN/password** - Even a simple 4-digit PIN prevents griefing
2. **Add input validation** - At minimum for PATCH endpoints
3. **Fix score input debouncing** - Quick fix
4. **Remove dead socket code** - Clean up confusion

### Soon After:

5. **Consolidate types** - Reduce maintenance burden
6. **Implement optimistic updates** - Better UX
7. **Migrate admin to dark theme** - Consistency
8. **Add error boundaries** - Stability

### Future:

9. **Add Pusher/real-time** - Better multi-device experience
10. **Add tests** - Long-term stability
11. **Add proper logging** - Debugging in production
12. **Add metadata/favicon** - Polish

---

## Quick Wins (< 30 min each)

| Fix | Time | Impact |
|-----|------|--------|
| Debounce score input | 5 min | Medium |
| Remove dead socket files | 10 min | Low (cleanup) |
| Add shared types file | 20 min | Medium |
| Add simple admin PIN | 30 min | High |
| Migrate admin to dark theme | 30 min | Low (consistency) |

---

## Security Checklist

- [ ] Admin authentication (PIN or password)
- [ ] Input validation on all PATCH/POST routes
- [ ] Rate limiting on API endpoints
- [ ] Remove console.log with sensitive data
- [ ] Add CSRF protection (Next.js has some built-in)
- [ ] Validate game IDs are valid CUIDs
