# WorkNest — Your team's daily command center

A full-featured, multi-tenant internal productivity platform. Teams create private workspaces, invite members via link or join code, and collaborate across tasks, chat, leaves, documents, and analytics — all in one place.

---

## What's New (v0.2)

| Feature | Description |
|---------|-------------|
| **Multi-tenant Workspaces** | Users create isolated workspaces. All data (tasks, chat, documents) is scoped per workspace. |
| **Workspace Join Code** | A short `XXX-XXX` code owners can share. Anyone can type it on the Join tab to become a member. |
| **Reusable Invite Links** | Owners generate shareable `/invite/[token]` URLs with optional max-uses and expiry. |
| **Role-Based Access Control** | Four workspace roles: Owner · Admin · Manager · Member. Invite tools are Owner-only. |
| **Private Notes** | Each user has a personal note-taking dashboard — never shared, never workspace-scoped. |
| **Leave Workspace** | Non-owner members can voluntarily leave a workspace from Settings. |
| **Delete Workspace** | Owners can permanently delete a workspace (requires typing the name to confirm). |
| **Task Delete Permissions** | Only the task creator or workspace owner can delete a task. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server + Client Components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 (responsive, mobile-first) |
| Animations | Framer Motion v12 |
| State | Zustand v5 + TanStack React Query v5 |
| API | tRPC v11 (end-to-end type-safe, no REST) |
| ORM | Prisma v5 |
| Database | Supabase (PostgreSQL + Realtime + Storage) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Email | Resend SDK |
| Cache / Rate-limit | Upstash Redis |
| Forms | React Hook Form v7 + Zod v4 |
| Charts | Recharts v3 |
| Drag & Drop | @dnd-kit |
| Rich Text | Tiptap v3 |
| Icons | lucide-react |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/kamashwara-dk/Worknest.git
cd Worknest
npm install
```

### 2. Configure environment variables

Create `.env.local` with the following:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://..."

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend (email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

> **Important:** Use the Transaction pooler URL (port 6543) for `DATABASE_URL` and include `?pgbouncer=true&connection_limit=1` to avoid connection exhaustion on serverless.

### 3. Set up the database

```bash
npm run db:push     # Push schema to Supabase
npm run db:seed     # Create admin user + default workspace
```

The seed prints the workspace join code and login credentials.

### 4. Configure Supabase

In your Supabase dashboard:
1. **Auth → Providers** — enable Email and Google OAuth
2. **Auth → URL Configuration** — add `http://localhost:3000/auth/callback` as a redirect URL
3. **Database → Realtime** — enable for `Message` and `Notification` tables

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## User Flow

```
Register / Login
    ↓
/workspaces  (workspace picker)
    ├── Select existing workspace  →  /w/[slug]/dashboard
    ├── Create new workspace       →  /workspaces/new
    └── Join a workspace           →  type join code  OR  paste invite link
            ↓
/w/[slug]/dashboard   (workspace home)
/w/[slug]/tasks       (Kanban + list view)
/w/[slug]/chat        (real-time channels)
/w/[slug]/leaves      (leave requests)
/w/[slug]/documents   (rich text docs)
/w/[slug]/team        (member directory)
/w/[slug]/announcements
/w/[slug]/analytics
/w/[slug]/settings    (Owner: invite tools, delete | Members: leave)
/notes                (private notes — no workspace scope)
/profile              (personal profile)
```

---

## Role-Based Access Control

| Action | Member | Manager | Admin | Owner |
|--------|--------|---------|-------|-------|
| View workspace data | ✅ | ✅ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ | ✅ |
| Delete own tasks | ✅ | ✅ | ✅ | ✅ |
| Delete any task | ❌ | ❌ | ❌ | ✅ |
| Approve/reject leaves | ❌ | ✅ | ✅ | ✅ |
| Create announcements | ❌ | ✅ | ✅ | ✅ |
| Manage member roles | ❌ | ❌ | ✅ | ✅ |
| View join code | ❌ | ❌ | ❌ | ✅ |
| Create invite links | ❌ | ❌ | ❌ | ✅ |
| Delete workspace | ❌ | ❌ | ❌ | ✅ |
| Leave workspace | ✅ | ✅ | ✅ | ❌ |

---

## Project Structure

```
worknest/
├── prisma/
│   ├── schema.prisma          # Full multi-tenant schema
│   └── seed.ts                # Admin + workspace seeder
├── src/
│   ├── app/
│   │   ├── (landing)/         # Public landing page
│   │   ├── (auth)/            # Login & Register
│   │   ├── (app)/             # Workspace-agnostic routes
│   │   │   ├── notes/         # Private notes dashboard
│   │   │   └── profile/       # User profile
│   │   ├── (workspaces)/      # Workspace picker + create
│   │   │   └── workspaces/
│   │   ├── w/[slug]/          # Workspace-scoped routes
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── chat/
│   │   │   ├── leaves/
│   │   │   ├── documents/
│   │   │   ├── team/
│   │   │   ├── announcements/
│   │   │   ├── analytics/
│   │   │   └── settings/      # RBAC settings page
│   │   ├── invite/[token]/    # Invite link acceptance
│   │   └── api/
│   │       ├── trpc/          # tRPC handler
│   │       └── auth/          # Auth helpers
│   ├── components/
│   │   ├── layout/            # Sidebar, Topbar, AppShell, WorkspaceBootstrap
│   │   ├── tasks/             # Kanban, TaskCard (with delete menu), TaskModal
│   │   ├── chat/              # Channels, messages
│   │   └── documents/         # Rich text editor
│   ├── server/
│   │   ├── trpc.ts            # Procedure tiers incl. workspaceOwnerProcedure
│   │   ├── context.ts         # Resolves workspace from x-workspace-id header
│   │   └── routers/
│   │       ├── workspaces.ts  # Workspace CRUD, join code, invite links
│   │       ├── invitations.ts # Email invitations
│   │       ├── notes.ts       # Private notes
│   │       └── ...            # tasks, chat, leaves, documents, etc.
│   ├── lib/
│   │   ├── joinCode.ts        # XXX-XXX code generator + normaliser
│   │   ├── supabase/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── resend.ts
│   └── store/
│       ├── useWorkspaceStore.ts  # Active workspace (persisted)
│       └── ...
└── .github/workflows/ci.yml
```

---

## Available Scripts

```bash
npm run dev          # Development server
npm run build        # prisma generate + next build
npm run start        # Production server
npm run type-check   # TypeScript check
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema to DB
npm run db:seed      # Seed admin + workspace
npm run db:studio    # Prisma Studio GUI
npm run test         # Unit tests
npm run test:e2e     # Playwright e2e tests
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel → add all env vars
3. Deploy — `prisma generate` runs automatically before `next build`

---

## License

MIT
