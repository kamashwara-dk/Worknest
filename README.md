# WorkNest — Your team's daily command center

A full-featured internal employee productivity hub covering task management, real-time team chat, leave requests, document sharing, team directory, announcements, and personal + team analytics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion v11 |
| State | Zustand v4 + React Query v5 |
| API | tRPC v11 (end-to-end type-safe) |
| ORM | Prisma v5 |
| Database | Supabase (PostgreSQL + Realtime + Storage) |
| Auth | Supabase Auth (email + Google OAuth) |
| Email | Resend SDK |
| Cache | Upstash Redis + Ratelimit |
| Forms | React Hook Form v7 + Zod v3 |
| Charts | Recharts v2 |
| Drag & Drop | @dnd-kit |
| Rich Text | Tiptap v2 |
| Icons | lucide-react |

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd worknest
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | PostgreSQL direct connection (for migrations) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `RESEND_API_KEY` | Resend API key for emails |
| `RESEND_FROM_EMAIL` | Sender email address |
| `NEXT_PUBLIC_APP_URL` | Your app URL (http://localhost:3000 for dev) |

### 3. Set up the database

```bash
# Push schema to your Supabase database
npm run db:push

# Or run migrations
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 4. Set up Supabase Auth

In your Supabase dashboard:
1. Enable **Email** auth provider
2. Enable **Google** OAuth provider (add Client ID + Secret)
3. Add redirect URL: `http://localhost:3000/auth/callback`
4. Enable **Realtime** for tables: `Message`, `Notification`

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts (after seeding)

| Role | Email | 
|------|-------|
| Admin | admin@worknest.app |
| Manager | manager@worknest.app |
| Employee | sarah@worknest.app |
| Employee | james@worknest.app |
| Employee | priya@worknest.app |

> Note: Demo accounts use seeded DB records. To log in, create matching Supabase Auth users with the same emails, or update the `supabaseId` fields in the seed to match your auth users.

## Project Structure

```
worknest/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (landing)/         # Public landing page
│   │   ├── (auth)/            # Login & Register
│   │   ├── (app)/             # Protected app routes
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── chat/
│   │   │   ├── leaves/
│   │   │   ├── documents/
│   │   │   ├── team/
│   │   │   ├── announcements/
│   │   │   ├── analytics/
│   │   │   └── profile/
│   │   └── api/
│   │       ├── trpc/          # tRPC handler
│   │       └── auth/          # Auth helpers
│   ├── components/
│   │   ├── landing/           # Landing page sections
│   │   ├── layout/            # Sidebar, Topbar, Notifications
│   │   ├── tasks/             # Kanban board, task cards
│   │   ├── chat/              # Channels, messages
│   │   ├── leaves/            # Leave forms
│   │   ├── documents/         # Rich text editor
│   │   └── analytics/         # Charts
│   ├── server/
│   │   ├── trpc.ts            # tRPC init + procedures
│   │   ├── context.ts         # Request context
│   │   └── routers/           # All API routers
│   ├── lib/
│   │   ├── supabase/          # Client + server Supabase
│   │   ├── prisma.ts          # Prisma client
│   │   ├── redis.ts           # Upstash Redis
│   │   ├── resend.ts          # Email helpers
│   │   ├── animations.ts      # Framer Motion variants
│   │   └── utils.ts           # Shared utilities
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript types
├── .github/workflows/ci.yml   # GitHub Actions CI
├── .env.local.example         # Environment template
├── next.config.js
├── tailwind.config.ts
└── vercel.json
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB
npm run db:migrate   # Run migrations
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
npm run test         # Run unit tests
npm run test:e2e     # Run Playwright e2e tests
```

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

The `vercel.json` is pre-configured.

### Environment Variables for Production

Make sure to set all variables from `.env.local.example` in your Vercel project settings.

## Features

- **Dashboard** — KPI cards, task completion chart, activity feed, pinned announcements
- **Tasks** — Kanban board with drag-and-drop, list view, filters, task modal
- **Chat** — Real-time messaging via Supabase Realtime, channels, file sharing
- **Leaves** — Request/approve/reject leaves, calendar view, email notifications
- **Documents** — Rich text editor (Tiptap), auto-save, version history, public/private
- **Team** — Directory with search, department filter, profile drawer
- **Announcements** — Pinned announcements, priority badges, admin create/delete
- **Analytics** — Task trends, priority charts, leave distribution, activity heatmap, CSV export
- **Profile** — Edit personal info, view stats

## License

MIT
