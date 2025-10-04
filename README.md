# TI4 Tracker

A real-time turn and time tracker for Twilight Imperium 4 games. Displays current player on TV, allows players to join via QR code on their phones, and provides an admin panel for score tracking and game control.

## Features

- **TV Display**: Large, color-coded display showing current player, faction, turn timer, and all player stats
- **Mobile Player View**: Players join via QR code and control their turns (Pass/End Turn) from their phones
- **Admin Panel**: Laptop-controlled interface for score management, game rewind, and QR code access
- **Real-time Sync**: Socket.io-powered live updates across all devices
- **Time Tracking**: Tracks per-turn time and total time per player
- **Game History**: Rewind functionality to undo accidental turn passes

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Socket.io for real-time
- **Database**: PostgreSQL with Prisma ORM
- **Local Dev**: Docker Compose for PostgreSQL

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for local development)
- npm

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Start the PostgreSQL container:

```bash
docker-compose up -d
```

Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

Generate Prisma client:

```bash
npx prisma generate
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Create a Game

1. Go to `http://localhost:3000`
2. Click "Create New Game"
3. Add players with their names, colors, and factions
4. Click "Start Game"

### 5. Access Different Views

- **TV Display**: `http://localhost:3000/game/[id]` - Shows current turn and all player stats
- **Mobile Join**: `http://localhost:3000/game/[id]/join` - Players scan QR code or visit this URL
- **Admin Panel**: `http://localhost:3000/game/[id]/admin` - Score management and game controls

## Project Structure

```
ti4tracker/
├── app/
│   ├── api/              # API routes
│   │   ├── games/        # Game CRUD
│   │   ├── players/      # Player management
│   │   └── turns/        # Turn tracking
│   ├── game/
│   │   ├── [id]/         # TV display
│   │   │   ├── join/     # Mobile player view
│   │   │   └── admin/    # Admin panel
│   │   └── new/          # Game creation
│   └── page.tsx          # Home page
├── components/
│   └── game/             # Reusable game components
├── lib/
│   ├── db.ts            # Prisma client
│   └── socket.ts        # Socket.io helpers
├── prisma/
│   └── schema.prisma    # Database schema
├── server.ts            # Custom server with Socket.io
└── docker-compose.yml   # PostgreSQL container
```

## Database Schema

- **Game**: Stores game state and current turn
- **Player**: Player info, color, faction, score, and total time
- **TurnHistory**: Historical record of all turns with duration tracking

## Environment Variables

Create a `.env` file (see `.env.example`):

```
DATABASE_URL="postgresql://ti4tracker:ti4tracker_dev@localhost:5432/ti4tracker"
```

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Import project to Vercel
3. Add PostgreSQL database (Neon, Vercel Postgres, or similar)
4. Set `DATABASE_URL` environment variable
5. Deploy

Note: Socket.io requires a persistent server, so for production you may need to:
- Use Vercel's Edge Functions with a different real-time solution (like Pusher or Supabase Realtime)
- Deploy to a platform that supports WebSockets (Railway, Render, Fly.io)

### Custom Domain Setup

For `mobcat.ca` subdomain:
1. In Vercel project settings, add custom domain
2. Update DNS with CNAME record pointing to Vercel

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma database GUI
```

## Features Implemented

- ✅ Game creation with multiple players
- ✅ Player color and faction assignment
- ✅ QR code generation for joining
- ✅ Real-time turn tracking
- ✅ Per-turn and total time tracking
- ✅ Mobile-first player controls
- ✅ Desktop-first TV display
- ✅ Admin panel with score management
- ✅ Game rewind functionality
- ✅ Socket.io real-time sync

## Future Enhancements

- [ ] Pause/Resume game
- [ ] Turn history visualization
- [ ] Average turn time stats
- [ ] Export game data
- [ ] Game presets (save player configurations)
- [ ] Sound notifications for turn changes

## License

MIT

---

Built with ❤️ for TI4 game nights
