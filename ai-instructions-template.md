# AI Development Instructions Template

## Project Overview
[Replace with 1-2 sentence description of the app]

## Core Principles
1. **Ship Fast, Iterate Later** - Get a working MVP quickly, then improve
2. **Mobile-First** - Design for phones first, desktop second
3. **User-Centric** - Every feature should solve a real user problem
4. **Production-Ready** - Always deployable to Vercel/similar platforms
5. **No Over-Engineering** - Use boring, proven tech that works

## Tech Stack (DO NOT DEVIATE)

### Frontend
- **Framework**: Next.js 15+ (App Router only, no Pages Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS only (no CSS modules, no styled-components)
- **UI Components**: Build custom first, use shadcn/ui if needed
- **State Management**: React hooks only (no Redux/Zustand unless absolutely necessary)

### Backend
- **API**: Next.js API routes (App Router style)
- **Database**: PostgreSQL (Docker for local, Neon/Vercel for production)
- **ORM**: Prisma (schema-first approach)
- **Authentication**: NextAuth v5 (email magic links via Resend)
- **File Storage**: Local filesystem (dev) → Vercel Blob (production)

### Development
- **Package Manager**: npm (not yarn/pnpm)
- **Linting**: ESLint with Next.js defaults
- **Formatting**: Prettier (optional)
- **Git**: Conventional commits, feature branches

## Project Structure (ENFORCE THIS)

```
app/
├── app/                     # Next.js App Router
│   ├── api/                # API routes
│   │   └── [resource]/     # RESTful endpoints
│   ├── auth/              # Auth pages (signin, error)
│   ├── [main-entity]/     # Main entity pages
│   │   ├── [id]/         # Detail/edit pages
│   │   └── new/          # Create page
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Home/list page
├── components/            # Reusable components
│   ├── ui/               # Generic UI components
│   └── [entity]/         # Entity-specific components
├── lib/                  # Utilities
│   ├── db.ts            # Prisma client singleton
│   └── [utils].ts       # Helper functions
├── prisma/
│   └── schema.prisma    # Database schema
├── public/              # Static assets
├── docker-compose.yml   # PostgreSQL for development
├── .env.example        # Environment template
└── README.md           # Comprehensive docs
```

## Development Workflow

### Phase 1: Foundation (Day 1)
1. Initialize Next.js with TypeScript and Tailwind
2. Set up Prisma with PostgreSQL
3. Create docker-compose.yml for local database
4. Implement basic CRUD for main entity
5. Deploy to Vercel (even if minimal)

### Phase 2: Core Features (Day 2-3)
1. Add authentication with NextAuth + Resend
2. Implement data relationships
3. Add search/filter capabilities
4. Create responsive mobile UI
5. Add validation and error handling

### Phase 3: Enhancement (Day 4-5)
1. Add secondary entities
2. Implement special features (specific to app)
3. Add data export/import
4. Optimize performance
5. Write comprehensive README

## Code Patterns

### API Routes Pattern
```typescript
// app/api/[entity]/route.ts
export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const data = await db.entity.findMany()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await request.json()
  const data = await db.entity.create({ data: body })
  return NextResponse.json(data)
}
```

### Component Pattern
```typescript
// components/[entity]/[entity]-card.tsx
interface EntityCardProps {
  data: Entity
  onUpdate?: () => void
}

export default function EntityCard({ data, onUpdate }: EntityCardProps) {
  // Client-side logic here
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Mobile-optimized layout */}
    </div>
  )
}
```

### Form Pattern
```typescript
// Always use native HTML forms with server actions or API calls
// Avoid heavy form libraries unless absolutely necessary
<form onSubmit={handleSubmit} className="space-y-4">
  <input 
    type="text" 
    name="field" 
    required
    className="w-full px-3 py-2 border rounded-lg text-black"
  />
  <button type="submit">Save</button>
</form>
```

## Database Schema Guidelines

1. **Use UUIDs**: `id String @id @default(cuid())`
2. **Add timestamps**: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`
3. **Soft deletes**: Consider `deletedAt DateTime?` instead of hard deletes
4. **Indexes**: Add for frequently queried fields
5. **Relations**: Use explicit relation names

Example:
```prisma
model Entity {
  id          String   @id @default(cuid())
  name        String
  description String?
  status      String   @default("active")
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
}
```

## UI/UX Guidelines

### Mobile-First Design
- Minimum touch target: 44x44px
- Stack layouts vertically on mobile
- Bottom-aligned CTAs for thumb reach
- Avoid hover-only interactions
- Test on real phones, not just browser DevTools

### Color Scheme
- Use Tailwind defaults
- Primary: green-600 (actions)
- Danger: red-600 (destructive)
- Info: blue-600 (links)
- Gray scale for text/borders

### Component Styling
```typescript
// Consistent styling patterns
const buttonStyles = "px-4 py-2 rounded-lg font-medium transition-colors"
const primaryButton = `${buttonStyles} bg-green-600 text-white hover:bg-green-700`
const secondaryButton = `${buttonStyles} bg-gray-200 text-gray-800 hover:bg-gray-300`
const inputStyles = "w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
```

## Authentication Setup

1. Use NextAuth v5 (not v4)
2. Email-only authentication via Resend
3. No passwords stored
4. Session-based auth
5. Workspace/team support from the start

## Error Handling

1. Always wrap async operations in try-catch
2. Show user-friendly error messages
3. Log errors to console in development
4. Return proper HTTP status codes
5. Implement optimistic UI updates

## Performance Optimization

1. Use dynamic imports for heavy components
2. Implement pagination early (don't load 1000 items)
3. Add loading states for all async operations
4. Use Next.js Image component for images
5. Minimize client-side JavaScript

## Deployment Checklist

- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Authentication configured
- [ ] Error handling complete
- [ ] Mobile responsive
- [ ] README comprehensive
- [ ] .env.example updated
- [ ] Docker setup works
- [ ] Vercel deployment tested

## Common Features to Implement

### Core (Required)
- [ ] CRUD operations for main entity
- [ ] Authentication
- [ ] Search/filter
- [ ] Pagination
- [ ] Mobile responsive design

### Enhanced (Choose relevant ones)
- [ ] Multi-user workspaces
- [ ] File/image uploads
- [ ] Export to CSV/JSON
- [ ] Status tracking/workflow
- [ ] Comments/notes system
- [ ] Tags/categories
- [ ] Favorites/bookmarks
- [ ] Sharing (public links)
- [ ] Dashboard with stats
- [ ] Activity history

### Advanced (If needed)
- [ ] Real-time updates (websockets)
- [ ] QR/NFC integration
- [ ] Email notifications
- [ ] API for external access
- [ ] Bulk operations
- [ ] Recurring tasks/schedules
- [ ] Data visualization/charts
- [ ] Full-text search

## Anti-Patterns to Avoid

1. **DON'T** create unnecessary abstractions
2. **DON'T** use CSS-in-JS libraries
3. **DON'T** implement your own auth
4. **DON'T** over-optimize prematurely
5. **DON'T** create files unless necessary
6. **DON'T** use complex state management
7. **DON'T** forget mobile users
8. **DON'T** skip error handling

## File Naming Conventions

- Components: `kebab-case.tsx` (e.g., `user-card.tsx`)
- API routes: `route.ts` in appropriately named folders
- Utilities: `kebab-case.ts` (e.g., `format-date.ts`)
- Types: Include in component files or `types.ts`

## Git Commit Messages

```
feat: Add user authentication
fix: Resolve mobile navigation issue
refactor: Simplify form validation
docs: Update README with setup instructions
style: Format code with Prettier
```

## Testing Priority

1. Manual testing on real devices
2. Critical user flows
3. API endpoint testing
4. Edge cases (empty states, errors)
5. Unit tests (if time permits)

## Sample Implementation Plan

Given a new CRUD app idea, follow this sequence:

### Hour 1-2: Setup
```bash
npx create-next-app@latest app --typescript --tailwind --app
cd app
npm install prisma @prisma/client next-auth@beta
npm install -D @types/node
npx prisma init
# Create docker-compose.yml
# Setup basic schema
# Create main entity CRUD
```

### Hour 3-4: Core Features
- Implement list/detail/create/edit/delete
- Add basic styling
- Ensure mobile responsiveness
- Deploy to Vercel

### Hour 5-6: Authentication
- Setup NextAuth with Resend
- Add protected routes
- Implement user association

### Hour 7-8: Polish
- Add search/filter
- Improve UI/UX
- Write documentation
- Handle edge cases

## Success Metrics

A well-built CRUD app should:
1. Load in <3 seconds on 3G
2. Work perfectly on mobile
3. Handle errors gracefully
4. Be deployable in one command
5. Have clear documentation
6. Support multiple users
7. Look professional (even if simple)

## Final Notes

- **Simplicity wins** - A working simple solution beats a complex broken one
- **User first** - Every decision should improve user experience
- **Ship early** - Deploy after basic CRUD works, iterate from there
- **Document everything** - Your future self (and users) will thank you
- **Have fun** - Add personality touches (like the plant name puns)

---

## Using This Template

1. Replace placeholder text with your app specifics
2. Delete irrelevant sections
3. Add app-specific requirements
4. Keep the structure and patterns
5. Follow the workflow strictly
6. Ask for clarification if needed

Remember: The goal is a production-ready app that users can actually use, not a perfect codebase that never ships.