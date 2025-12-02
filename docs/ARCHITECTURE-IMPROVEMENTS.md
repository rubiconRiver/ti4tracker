# Architecture Improvements Plan

## Current Architecture Analysis

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes (serverless on Vercel)
- **Database**: PostgreSQL via Prisma
- **Deployment**: Vercel (serverless)

### Current Real-Time Implementation

```
┌─────────────┐     polling (2s)      ┌─────────────┐
│   Client    │ ──────────────────►   │   Vercel    │
│  (Browser)  │ ◄──────────────────   │  Serverless │
└─────────────┘                       └─────────────┘
                                            │
                                            ▼
                                      ┌───────────┐
                                      │ PostgreSQL│
                                      └───────────┘
```

**Files involved:**
- `components/game/use-game-polling.tsx` - Polls `/api/games/{id}` every 2 seconds
- `server.ts` - Custom server with Socket.io (only works in dev, NOT on Vercel)
- `lib/socket.ts` - `emitToGame()` helper that does nothing on Vercel

### Problems Identified

1. **Socket.io is dead code in production**
   - `server.ts` sets up Socket.io but Vercel uses `next start` (serverless)
   - All `emitToGame()` calls do nothing - `(global as any).io` is always `null`

2. **Polling is inefficient**
   - Every client polls every 2 seconds regardless of activity
   - Creates unnecessary database load
   - Up to 2 second delay for updates to appear

3. **No optimistic updates**
   - "End Turn" click flow:
     1. User clicks button
     2. POST request sent to server
     3. Server does 4+ database operations
     4. Response returns
     5. UI waits for next polling cycle (up to 2 more seconds!)
   - Total perceived delay: 1-4 seconds

4. **Poor error handling**
   - Fetch errors logged to console but UI doesn't recover
   - No retry logic
   - No loading states on actions

---

## Solution: Two-Phase Approach

### Phase 1: Optimistic Updates (Quick Win - No External Services)

Immediately improve perceived performance by updating UI before server confirms.

**Pattern:**
```typescript
const handleEndTurn = async () => {
  // 1. Optimistically update local state
  setGame(prev => ({
    ...prev,
    currentPlayerTurnOrder: getNextPlayer(prev),
    currentTurn: prev.currentTurn + 1,
  }));

  // 2. Send request to server
  try {
    const result = await fetch('/api/turns', { ... });
    const data = await result.json();
    // 3. Reconcile with server state
    setGame(data.game);
  } catch (error) {
    // 4. Rollback on error
    refetch();
  }
};
```

**Benefits:**
- Zero perceived delay on button click
- Works without any external services
- Can implement today

**Implementation:**
- Create `useGameState` hook with optimistic mutation support
- Add loading/pending states to buttons
- Add error boundaries and recovery

### Phase 2: Real-Time Updates (External Service)

Replace polling with push-based updates for multi-device sync.

#### Option A: Pusher (Recommended for simplicity)

**Pros:**
- Free tier: 200k messages/day, 100 connections
- Simple API, good Next.js integration
- Battle-tested, reliable

**Cons:**
- Vendor lock-in
- Costs scale with usage

**Architecture:**
```
┌─────────────┐                    ┌─────────────┐
│   Client    │◄──── WebSocket ───►│   Pusher    │
└─────────────┘                    └─────────────┘
       │                                  ▲
       │ HTTP                             │ HTTP trigger
       ▼                                  │
┌─────────────┐                           │
│   Vercel    │───────────────────────────┘
│  Serverless │
└─────────────┘
```

**Implementation:**
```typescript
// API route: Trigger Pusher event after DB update
import Pusher from 'pusher';

const pusher = new Pusher({ ... });

// In /api/turns/route.ts
await pusher.trigger(`game-${gameId}`, 'turn-ended', {
  game: updatedGame,
  nextPlayerId: nextPlayer?.id,
});
```

```typescript
// Client: Subscribe to game channel
import PusherClient from 'pusher-js';

const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY);
const channel = pusher.subscribe(`game-${gameId}`);

channel.bind('turn-ended', (data) => {
  setGame(data.game);
});
```

#### Option B: Ably

**Pros:**
- More features (presence, history)
- Better debugging tools
- Strong TypeScript support

**Cons:**
- More complex setup
- Slightly higher learning curve

#### Option C: PartyKit / Cloudflare Durable Objects

**Pros:**
- Edge-native, very fast
- Stateful WebSocket servers
- Can run game logic on server

**Cons:**
- Separate deployment from Vercel
- Newer, less documentation

#### Option D: Server-Sent Events (SSE)

**Pros:**
- Native browser support
- Simpler than WebSockets
- Works with Vercel Edge Functions

**Cons:**
- One-way only (server → client)
- Still need HTTP for client → server
- Edge functions have time limits

---

## Recommended Implementation Order

### Immediate (Phase 1)

1. **Implement optimistic updates for "End Turn"**
   - Zero external dependencies
   - Fixes the perceived delay immediately

2. **Add loading states to buttons**
   - Show spinner while request in flight
   - Disable button to prevent double-clicks

3. **Improve error handling**
   - Show toast/error message on failure
   - Auto-retry on network errors

### Short-term (Phase 2)

4. **Integrate Pusher or Ably**
   - Replace polling with push updates
   - Keep optimistic updates as primary UX

5. **Remove dead socket.io code**
   - Delete `server.ts` custom server
   - Remove socket.io dependencies
   - Clean up `lib/socket.ts`

### Future Considerations

6. **Consider React Query or SWR**
   - Built-in caching, revalidation, optimistic updates
   - Would simplify data fetching patterns

7. **Add offline support**
   - Queue actions when offline
   - Sync when connection restored

---

## New Architecture (Target State)

```
┌─────────────┐                    ┌─────────────┐
│   Client    │◄──── WebSocket ───►│   Pusher    │
│  (Browser)  │                    │   /Ably     │
└─────────────┘                    └─────────────┘
       │                                  ▲
       │ HTTP (optimistic)                │ trigger
       ▼                                  │
┌─────────────┐                           │
│   Vercel    │───────────────────────────┘
│  Serverless │
└─────────────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │
└─────────────┘
```

**Data flow for "End Turn":**
1. User clicks "End Turn"
2. UI immediately shows next player (optimistic)
3. Button shows loading spinner
4. Request sent to Vercel API
5. API updates database
6. API triggers Pusher event
7. All connected clients receive update
8. Clients reconcile state (usually matches optimistic update)

---

## File Changes Required

### Phase 1: Optimistic Updates

**New files:**
- `lib/hooks/use-game-state.ts` - State management with optimistic mutations
- `lib/hooks/use-game-actions.ts` - Action handlers (endTurn, pass, etc.)

**Modified files:**
- `app/game/[id]/join/page.tsx` - Use new hooks
- `app/game/[id]/page.tsx` - Use new hooks
- `app/game/[id]/admin/page.tsx` - Use new hooks
- `components/ui/button.tsx` - Already has loading prop

### Phase 2: Pusher Integration

**New files:**
- `lib/pusher/server.ts` - Server-side Pusher client
- `lib/pusher/client.ts` - Client-side Pusher setup
- `lib/hooks/use-game-subscription.ts` - Subscribe to game events

**Modified files:**
- `app/api/turns/route.ts` - Trigger Pusher events
- `app/api/rounds/route.ts` - Trigger Pusher events
- `app/api/players/route.ts` - Trigger Pusher events

**Deleted files:**
- `server.ts` - Custom server no longer needed
- `lib/socket.ts` - Replace with Pusher

**Package changes:**
- Remove: `socket.io`, `socket.io-client`
- Add: `pusher`, `pusher-js`

---

## Cost Analysis (Pusher)

**Free Tier:**
- 200,000 messages/day
- 100 concurrent connections
- Unlimited channels

**For TI4 Tracker:**
- A 6-player game with active play: ~100-200 events/hour
- Even with 10 concurrent games: ~2,000 events/hour
- Daily max: ~50,000 events (well under free tier)

**Conclusion:** Free tier is more than sufficient.

---

## References

- [Vercel: Publish and Subscribe to Realtime Data](https://vercel.com/kb/guide/publish-and-subscribe-to-realtime-data-on-vercel)
- [Vercel: Deploying Pusher with Vercel](https://vercel.com/kb/guide/deploying-pusher-channels-with-vercel)
- [Ably: Realtime Chat with Next.js](https://ably.com/blog/realtime-chat-app-nextjs-vercel)
