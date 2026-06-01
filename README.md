# WorkNest — Your team's daily command center

A full-featured, multi-tenant internal productivity platform. Teams create private workspaces, invite members via link or join code, and collaborate across tasks, real-time chat (channels + DMs), leaves, documents, and analytics — all in one place.

---

## Feature Highlights

| Feature | Description |
|---------|-------------|
| **Multi-tenant Workspaces** | Isolated workspaces — all data scoped per workspace. Switch between workspaces from the picker. |
| **Workspace Join Code** | Short `XXX-XXX` code owners share. Anyone types it on the Join tab to become a member instantly. |
| **Reusable Invite Links** | Owners generate `/invite/[token]` URLs with optional max-uses and expiry. |
| **Role-Based Access Control** | Four roles: Owner · Admin · Manager · Member. Invite tools are Owner-only. |
| **Private Notes** | Personal note-taking dashboard — never shared, never workspace-scoped. Share notes as announcements. |
| **Direct Messages** | WhatsApp-style 1-on-1 DMs alongside channels. Presence indicators show who's online. |
| **Two-Tiered Announcements** | Workspace announcements (Manager+) and system-wide Global announcements (Super Admin). |
| **Note → Announcement** | Share a private note as a workspace announcement with one click. |
| **Optimistic Chat** | Messages appear instantly in the UI before the server confirms — with automatic rollback on error. |
| **Task Delete Permissions** | Only the task creator or workspace owner can delete a task. |
| **Leave / Delete Workspace** | Members can leave; owners can permanently delete (requires typing the name to confirm). |
| **Feedback Space** | Chat-style feedback widget on the landing page — visitors drop thoughts in real time. |
| **Developer Footer** | Clean footer with developer profile picture, name, and social links. |
| **PWA Support** | Installable on mobile home screens via Web App Manifest + Service Worker. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server + Client Components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 (responsive, mobile-first) |
| Animations | Framer Motion v12 |
| State | Zustand v5 + TanStack React Query v5 |
| API | tRPC v11 (end-to-end type-safe) |
| ORM | Prisma v5 |
| Database | Supabase (PostgreSQL + Realtime + Storage) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Real-time | Supabase Realtime (channels, DMs, presence) |
| Email | Resend SDK |
| Cache / Rate-limit | Upstash Redis |
| Forms | React Hook Form v7 + Zod v4 |
| Charts | Recharts v3 |
| Drag & Drop | @dnd-kit |
| Rich Text | Tiptap v3 |
| Icons | lucide-react |

> **Note:** The backend is Next.js API routes + tRPC — not a separate Flask server. All server logic lives in `src/server/routers/`.

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/kamashwara-dk/Worknest.git
cd Worknest
npm install
```

### 2. Configure environment variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database — Transaction pooler for runtime, Direct for migrations
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

### 3. Set up the database

```bash
npm run db:push     # Push schema to Supabase
npm run db:seed     # Create admin user + default workspace
```

The seed prints the workspace join code and login credentials.

### 4. Configure Supabase

In your Supabase dashboard:
1. **Auth → Providers** — enable Email and Google OAuth
2. **Auth → URL Configuration** — add `http://localhost:3000/auth/callback`
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
/w/[slug]/dashboard      workspace home — KPIs, tasks, announcements
/w/[slug]/tasks          Kanban board + list view
/w/[slug]/chat           Channels + 1-on-1 Direct Messages with presence
/w/[slug]/leaves         Leave requests + approvals
/w/[slug]/documents      Rich text document hub
/w/[slug]/team           Member directory
/w/[slug]/announcements  Workspace + Global tabs
/w/[slug]/analytics      Charts, heatmaps, CSV export
/w/[slug]/settings       Owner: invite tools, delete | Members: leave
/notes                   Private notes (share to announcements)
/profile                 Personal profile
/invite/[token]          Invite link acceptance page
```

---

## Role-Based Access Control

| Action | Member | Manager | Admin | Owner | Super Admin |
|--------|--------|---------|-------|-------|-------------|
| View workspace data | ✅ | ✅ | ✅ | ✅ | ✅ |
| Send channel messages / DMs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete own tasks | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete any task | ❌ | ❌ | ❌ | ✅ | ✅ |
| Approve/reject leaves | ❌ | ✅ | ✅ | ✅ | — |
| Create workspace announcements | ❌ | ✅ | ✅ | ✅ | — |
| Share note as announcement | ❌ | ✅ | ✅ | ✅ | — |
| Manage member roles | ❌ | ❌ | ✅ | ✅ | — |
| View join code | ❌ | ❌ | ❌ | ✅ | — |
| Create invite links | ❌ | ❌ | ❌ | ✅ | — |
| Delete workspace | ❌ | ❌ | ❌ | ✅ | — |
| Leave workspace | ✅ | ✅ | ✅ | ❌ | — |
| Post global announcements | ❌ | ❌ | ❌ | ❌ | ✅ |

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
│   │   │   ├── notes/         # Private notes (share to announcements)
│   │   │   └── profile/
│   │   ├── (workspaces)/      # Workspace picker + create
│   │   ├── w/[slug]/          # Workspace-scoped routes
│   │   │   ├── chat/          # Channels + DMs
│   │   │   ├── announcements/ # Two-tiered (workspace + global)
│   │   │   └── settings/      # RBAC settings
│   │   └── invite/[token]/    # Invite link acceptance
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChannelList.tsx
│   │   │   ├── DMList.tsx         # DM sidebar with presence dots
│   │   │   ├── MessageList.tsx    # Infinite scroll, optimistic UI
│   │   │   ├── MessageInput.tsx   # Optimistic send with rollback
│   │   │   └── MessageBubble.tsx
│   │   ├── layout/            # Sidebar, Topbar, WorkspaceBootstrap
│   │   └── tasks/             # Kanban, TaskCard, TaskModal
│   ├── server/routers/
│   │   ├── chat.ts            # channels + dm sub-routers
│   │   ├── announcements.ts   # workspace + global + shareFromNote
│   │   ├── workspaces.ts      # CRUD, join code, invite links
│   │   ├── notes.ts           # Private notes
│   │   └── ...
│   ├── hooks/
│   │   ├── useRealtimeMessages.ts  # Scoped Supabase subscription
│   │   └── usePresence.ts          # Supabase Presence for online status
│   └── store/
│       ├── useWorkspaceStore.ts
│       └── useChatStore.ts    # Messages, unread counts, online users
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

## PWA — Install on Mobile Home Screen

WorkNest ships with a Web App Manifest and Service Worker so it can be installed as a native-feeling app on any mobile device.

### What's included
| File | Purpose |
|------|---------|
| `public/manifest.json` | App name, icons, theme colour, start URL |
| `public/sw.js` | Caches static assets, serves offline fallback |
| `src/app/layout.tsx` | Registers SW, adds `<meta>` tags for iOS/Android |

### Steps to install

**Android (Chrome)**
1. Open `https://worknest-ai.vercel.app` in Chrome
2. Tap the **⋮ menu → "Add to Home screen"**
3. Confirm — the WorkNest icon appears on your home screen

**iOS (Safari)**
1. Open the URL in Safari
2. Tap the **Share button (□↑) → "Add to Home Screen"**
3. Tap **Add** — the app opens full-screen without browser chrome

**Desktop (Chrome / Edge)**
1. Look for the **install icon (⊕)** in the address bar
2. Click **Install** — WorkNest opens as a standalone window

### Icon requirements
The manifest references `icon-192.png` and `icon-512.png`. Generate them from `worknest-icon.svg`:
```bash
# Using Inkscape CLI (or any SVG→PNG converter)
inkscape -w 192 -h 192 public/worknest-icon.svg -o public/icon-192.png
inkscape -w 512 -h 512 public/worknest-icon.svg -o public/icon-512.png
```
Or use an online tool like [realfavicongenerator.net](https://realfavicongenerator.net).

---

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel → add all env vars
3. Deploy — `prisma generate` runs automatically before `next build`

---

## License

MIT
