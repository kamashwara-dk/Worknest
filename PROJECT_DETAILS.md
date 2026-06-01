# WorkNest — Complete Project Documentation

> **"Your team's daily command center."**
> A full-featured, multi-tenant internal productivity platform built for modern teams.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What's New in v0.3](#2-whats-new-in-v03)
3. [Who It's Built For](#3-who-its-built-for)
4. [Core Modules & Features](#4-core-modules--features)
5. [Tech Stack](#5-tech-stack)
6. [Architecture & Connectivity](#6-architecture--connectivity)
7. [Database Schema](#7-database-schema)
8. [Multi-Tenant System](#8-multi-tenant-system)
9. [Role-Based Access Control](#9-role-based-access-control)
10. [Invitation System](#10-invitation-system)
11. [Private Notes](#11-private-notes)
12. [Direct Messaging System](#12-direct-messaging-system)
13. [Announcement System](#13-announcement-system)
14. [External Service Integrations](#14-external-service-integrations)
15. [Security Model](#15-security-model)
16. [Responsive Design](#16-responsive-design)
17. [Design System](#17-design-system)
18. [Environment Variables](#18-environment-variables)
19. [NPM Scripts](#19-npm-scripts)
20. [Future Scope](#20-future-scope)

---

## 1. Project Overview

WorkNest is a **unified internal productivity platform** that consolidates the tools a modern team uses every day into a single, cohesive interface.

| Property | Value |
|----------|-------|
| App Name | WorkNest |
| Version | 0.3.0 |
| Type | Full-Stack Web Application |
| Rendering | Server-Side + Client-Side (Hybrid) |
| Deployment Target | Vercel (Edge-compatible) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Email + Google OAuth) |
| Real-time | Supabase Realtime (WebSockets + Presence) |
| Multi-tenancy | Workspace-scoped data isolation |

---

## 2. What's New in v0.3

### 1-on-1 Direct Messages
WhatsApp-style DMs alongside the existing channel system. Any workspace member can start a private conversation with any other member. The `Conversation` model stores the pair with a unique constraint preventing duplicates. Messages are delivered in real-time via Supabase Realtime, scoped strictly to the active conversation.

### Presence Indicators
Real-time online/offline status for all workspace members using Supabase Presence. Green dots appear next to member avatars in the DM sidebar and the "New Chat" member picker. Presence is tracked per workspace and cleaned up automatically on disconnect.

### Optimistic UI for Chat
Messages appear in the UI the instant the user hits Send — before the server responds. Built with TanStack React Query's `onMutate` hook. If the server returns an error, the optimistic message is automatically removed and a toast is shown. This eliminates all perceived latency.

### Infinite Scroll Message History
Channel and DM message history uses cursor-based pagination via `useInfiniteQuery`. The initial load fetches the 50 most recent messages. Scrolling to the top of the thread automatically fetches the next page. No full-list re-renders.

### Two-Tiered Announcement System
- **Workspace Announcements** — posted by Managers/Admins/Owners, visible only to that workspace's members
- **Global Announcements** — posted by Super Admins (`isSuperAdmin: true` on the User model), visible to all users across all workspaces on the Global Updates tab

### Note → Announcement Sharing
A `Megaphone` button on each private note card opens a modal to publish the note as a workspace announcement. The system checks that the user has Manager/Admin/Owner role in the target workspace before publishing. Users with no eligible workspaces see a warning instead.

### What's New in v0.2 (retained)
- Multi-tenant workspaces with full data isolation
- Workspace join code (`XXX-XXX` format)
- Reusable invite links with max-uses and expiry
- Role-Based Access Control (Owner/Admin/Manager/Member)
- Private notes dashboard
- Leave workspace / Delete workspace
- Task delete permissions (creator or owner only)- **Not workspace-scoped** — accessible regardless of which workspace is active
- Supports pinning, tagging, search, and delete
- Stored in a separate `Note` model with `userId` as the only scope

### Leave Workspace
Non-owner members can voluntarily leave a workspace from the Settings page. The action requires a confirmation step and immediately revokes all access. The workspace owner cannot leave — they must delete the workspace or transfer ownership first.

### Delete Workspace (Owner Only)
Owners can permanently delete a workspace from Settings. The action requires typing the exact workspace name to confirm. Deletion cascades to all workspace data via Prisma's `onDelete: Cascade` relations.

### Task Delete Permissions
Task deletion is now permission-gated. Only the **task creator** or the **workspace owner** can delete a task. The backend enforces this check before executing the delete. The UI shows the delete button (in the task card hover menu and the edit modal) only to eligible users.

---

## 3. Who It's Built For

### Primary Users

| Role | Description |
|------|-------------|
| **Employees / Members** | Day-to-day task tracking, leave requests, team chat, document access, private notes |
| **Managers** | Leave approvals, task assignment, team oversight, announcements |
| **Admins** | Member management, workspace configuration |
| **Owners** | Full platform control — invite management, workspace lifecycle |

### Ideal Organizations
- **Startups (5–200 people)** — Replace 4–6 separate SaaS tools with one platform
- **SMEs** — Affordable alternative to enterprise suites
- **Remote-first teams** — Async communication, document sharing, visibility across time zones
- **Agencies & consultancies** — Project tracking, client-facing team directories
- **Educational institutions** — Staff coordination, leave management, announcements

---

## 4. Core Modules & Features

### 4.1 Workspace Management
- Create workspaces with auto-generated URL slugs
- Workspace picker at `/workspaces` — lists all memberships
- Join via `XXX-XXX` code or `/invite/[token]` URL
- Workspace switcher in the sidebar
- Settings page with RBAC-gated sections

### 4.2 Dashboard
- Personalized greeting with time-aware message
- 4 KPI cards: Open Tasks, Pending Leaves, Team Members, Completion Rate
- Animated count-up numbers on load
- Task completion donut chart (Recharts)
- Recent tasks feed
- Pinned announcements
- Pending leave requests

### 4.3 Task Management
- **Kanban Board** — 4 columns: To Do → In Progress → In Review → Done
- Drag-and-drop between columns (dnd-kit)
- **List View** — sortable, filterable table
- Task cards with priority badge, assignee avatar, due date, tags
- Create/edit modal with full fields
- Delete button visible only to task creator or workspace owner
- Hover menu on task cards with delete option

### 4.4 Real-time Chat
- Channel-based messaging (workspace-scoped channels)
- Real-time message delivery via Supabase Realtime
- Message grouping by sender + time proximity
- Typing indicators via Supabase Presence
- Unread count badges per channel

### 4.5 Leave Management
- Submit leave requests (6 types: Sick, Casual, Earned, Maternity, Paternity, Unpaid)
- Manager/Admin: approve or reject with comments
- Email notifications on approval/rejection (Resend)
- Leave history table with status badges

### 4.6 Document Hub
- Document grid with search and tag filtering
- **Tiptap rich-text editor** — headings, bold, italic, lists, code blocks
- Auto-save every 30 seconds
- Version counter
- Public/private toggle per document

### 4.7 Team Directory
- Searchable grid of all workspace members
- Department filter tabs
- Member cards with avatar, name, designation, role badge
- Click-to-open profile drawer

### 4.8 Announcements
- Pinned announcements highlighted at top
- Priority badges: URGENT, HIGH, MEDIUM, LOW
- Expiry date support
- Manager/Admin: create with rich text, priority, pin toggle

### 4.9 Analytics
- Date range selector: 7d / 30d / 90d
- KPI row: Total Tasks, Completion Rate, Active Members, Pending Leaves
- Task trend line chart
- Tasks by priority stacked bar chart
- Leave distribution by type pie chart
- Team activity heatmap
- Export to CSV

### 4.10 Private Notes
- Personal note-taking dashboard at `/notes`
- Completely private — not visible to workspace members
- Pin/unpin notes
- Search across title and content
- Tag support
- Delete with confirmation

### 4.11 Profile
- Avatar upload (Supabase Storage)
- Bio, designation, department, phone
- Social links: LinkedIn, Twitter/X, GitHub, Website
- Account info: email, role, member since

### 4.12 Workspace Settings (Owner)
- **Join Code** — view, copy, regenerate, enable/disable
- **Invite Links** — create with label/max-uses/expiry, copy, deactivate, delete
- **Delete Workspace** — requires typing workspace name to confirm

### 4.13 Workspace Settings (Members)
- **Leave Workspace** — with confirmation step

---

## 5. Tech Stack

### Frontend
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.4 |
| Language | TypeScript (strict mode) | ^5 |
| Styling | Tailwind CSS v4 | ^4 |
| Animations | Framer Motion | ^12 |
| State (client) | Zustand | ^5 |
| State (server) | TanStack React Query | ^5 |

### Backend
| Layer | Technology | Version |
|-------|-----------|---------|
| API Layer | tRPC | ^11 |
| ORM | Prisma | ^5 |
| Runtime | Node.js (via Next.js) | 20+ |
| Serialization | SuperJSON | ^2 |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL + Auth + Realtime + Storage |
| Upstash Redis | Caching + Rate limiting |
| Resend | Transactional email (invitations, leave approvals) |
| Vercel | Hosting + Edge deployment |

> **Note on backend:** WorkNest uses **Next.js API routes + tRPC** as its backend layer — not Flask. All server logic lives in `src/server/routers/` and is served via `/api/trpc`. There is no separate backend server.

---

## 6. Architecture & Connectivity

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                                                                 │
│  React 19 + Next.js App Router                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ Zustand      │  │ React Query  │  │ Framer Motion /    │    │
│  │ workspaceStore│  │ tRPC cache  │  │ Recharts / dnd-kit │    │
│  └──────┬───────┘  └──────┬───────┘  └────────────────────┘    │
│         │                 │                                     │
│         └─────────────────┼─────────────────────────────────   │
│                           │ tRPC HTTP Batch                     │
│                           │ + x-workspace-id header             │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    NEXT.JS SERVER (Vercel)                       │
│                                                                 │
│  tRPC Router  /api/trpc/[trpc]                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  workspaces · invitations · notes · tasks · chat        │   │
│  │  leaves · documents · announcements · notifications     │   │
│  │  users · analytics                                      │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│  Context: { user, dbUser, dbMembership, workspaceId, prisma }  │
│  Workspace resolved from x-workspace-id request header         │
│                         │                                       │
│  Procedure tiers:                                               │
│  publicProcedure → protectedProcedure → workspaceProcedure     │
│  → workspaceManagerProcedure → workspaceAdminProcedure         │
│  → workspaceOwnerProcedure                                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────────────────────┐
        │              │                              │
┌───────▼──────┐ ┌─────▼──────────┐ ┌───────────────▼──────┐
│  Supabase    │ │  Upstash Redis │ │      Resend          │
│  PostgreSQL  │ │  Rate limiting │ │  Invitation emails   │
│  Auth        │ │  Query cache   │ │  Leave approvals     │
│  Realtime    │ └────────────────┘ └──────────────────────┘
│  Storage     │
└──────────────┘
```

### Workspace Isolation Pattern
Every tRPC request that requires workspace context sends an `x-workspace-id` header (set automatically by the tRPC client from the Zustand `workspaceStore`). The server context resolves the workspace and verifies membership before the procedure runs. All database queries include `WHERE workspaceId = ctx.workspaceId`.

---

## 7. Database Schema

### Core Models

```
User
  id, supabaseId, email, name, avatar, role
  department, designation, phone, bio, social links
  joinedAt, isActive

Workspace
  id, name, slug (unique), logoUrl, ownerId
  joinCode (unique, XXX-XXX format), joinCodeEnabled

Membership
  id, userId → User, workspaceId → Workspace
  role (OWNER | ADMIN | MANAGER | MEMBER)
  @@unique([userId, workspaceId])

Invitation  (email-specific, single-use)
  id, email, workspaceId, invitedById, token (unique)
  status (PENDING | ACCEPTED | EXPIRED | REVOKED)
  expiresAt

WorkspaceInviteLink  (reusable, open)
  id, workspaceId, createdById, token (unique)
  label, maxUses, useCount, expiresAt, isActive

Note  (private per-user, no workspace scope)
  id, userId, title, content, color, pinned, tags

Task
  id, workspaceId, title, description
  status (TODO | IN_PROGRESS | IN_REVIEW | DONE)
  priority (LOW | MEDIUM | HIGH | URGENT)
  assigneeId → User, creatorId → User
  tags, attachments, order

LeaveRequest
  id, workspaceId, userId
  type (SICK | CASUAL | EARNED | MATERNITY | PATERNITY | UNPAID)
  startDate, endDate, reason
  status (PENDING | APPROVED | REJECTED | CANCELLED)
  approvedBy, comments

Message
  id, channelId → Channel, senderId → User
  content, type (TEXT | IMAGE | FILE), fileUrl

Channel
  id, workspaceId, name, description, isPrivate
  @@unique([workspaceId, name])

Document
  id, workspaceId, title, content, authorId
  isPublic, tags, fileUrl, version

Announcement
  id, workspaceId, title, body, authorId
  priority, pinned, expiresAt

Notification
  id, workspaceId, userId, title, body, type, read, link
```

---

## 8. Multi-Tenant System

### Data Isolation
Every workspace-scoped model (`Task`, `Channel`, `Message`, `LeaveRequest`, `Document`, `Announcement`, `Notification`) has a `workspaceId` foreign key. All queries filter by `workspaceId` — a user in Workspace A can never see data from Workspace B.

### Workspace Resolution
1. User selects a workspace → Zustand `workspaceStore` stores `{ id, slug, name, role }`
2. tRPC client sends `x-workspace-id: <workspaceId>` header on every request
3. Server context reads the header, verifies the user is a member, and attaches `workspaceId` + `dbMembership` to the context
4. All workspace-scoped procedures receive a guaranteed `ctx.workspaceId`

### WorkspaceBootstrap Component
A client component rendered inside the workspace layout (`/w/[slug]/layout.tsx`) that hydrates the Zustand store from server-resolved data on every page load — ensuring hard refreshes and direct URL navigation always have the correct workspace in state.

---

## 9. Role-Based Access Control

### Procedure Tiers (server-enforced)

| Procedure | Requirement |
|-----------|-------------|
| `publicProcedure` | No auth required |
| `protectedProcedure` | Valid Supabase session |
| `workspaceProcedure` | Session + workspace membership |
| `workspaceManagerProcedure` | Membership with role MANAGER/ADMIN/OWNER |
| `workspaceAdminProcedure` | Membership with role ADMIN/OWNER |
| `workspaceOwnerProcedure` | Membership with role OWNER only |

### Permission Matrix

| Action | Member | Manager | Admin | Owner |
|--------|--------|---------|-------|-------|
| View workspace data | ✅ | ✅ | ✅ | ✅ |
| Create/edit tasks | ✅ | ✅ | ✅ | ✅ |
| Delete own tasks | ✅ | ✅ | ✅ | ✅ |
| Delete any task | ❌ | ❌ | ❌ | ✅ |
| Request leave | ✅ | ✅ | ✅ | ✅ |
| Approve/reject leave | ❌ | ✅ | ✅ | ✅ |
| Create announcements | ❌ | ✅ | ✅ | ✅ |
| Manage member roles | ❌ | ❌ | ✅ | ✅ |
| View join code | ❌ | ❌ | ❌ | ✅ |
| Regenerate join code | ❌ | ❌ | ❌ | ✅ |
| Create invite links | ❌ | ❌ | ❌ | ✅ |
| Delete workspace | ❌ | ❌ | ❌ | ✅ |
| Leave workspace | ✅ | ✅ | ✅ | ❌ |

---

## 10. Invitation System

### Method 1 — Workspace Join Code
- Format: `XXX-XXX` (6 uppercase alphanumeric chars, no ambiguous characters)
- Stored as `joinCode` on the `Workspace` model (`@unique`)
- Owner can regenerate (old code immediately invalidated) or disable
- User enters code on `/workspaces` → "Join a Workspace" tab
- Backend normalises input (strips spaces/dashes, re-inserts dash) before lookup

### Method 2 — Reusable Invite Link
- Token stored in `WorkspaceInviteLink` model
- URL format: `https://[app]/invite/[token]`
- Any authenticated user who visits the link can join
- Use count tracked atomically; auto-invalidates at `maxUses`
- Owner can deactivate or delete links from Settings

### Method 3 — Email Invitation (existing)
- Tied to a specific email address
- Single-use token in `Invitation` model
- 7-day expiry
- Sent via Resend with branded HTML template
- Validates that the accepting user's email matches the invitation

---

## 11. Private Notes

The `Note` model is scoped exclusively to `userId` — there is no `workspaceId`. This means:
- Notes are accessible from any workspace context (sidebar link `/notes`)
- Notes are never visible to other workspace members
- Notes survive workspace deletion
- The `notes` tRPC router uses `protectedProcedure` (not `workspaceProcedure`)

Features: create, update, delete, pin/unpin, search by title/content, tag filtering.

---

## 12. Direct Messaging System

### Architecture
The DM system introduces a `Conversation` model that links exactly two workspace members. A unique constraint `@@unique([workspaceId, memberOneId, memberTwoId])` with canonical ordering (smaller ID = memberOne) ensures only one conversation can exist per pair per workspace.

`Message` now has an optional `conversationId` alongside the existing optional `channelId`. A message belongs to exactly one thread — either a channel or a conversation, never both.

### tRPC Endpoints
| Procedure | Description |
|-----------|-------------|
| `chat.dm.conversations` | List all DM threads for the current user with last message preview |
| `chat.dm.getOrCreate` | Upsert a conversation between two members (canonical ordering) |
| `chat.dm.messages` | Cursor-based paginated message history (verifies participation) |
| `chat.dm.send` | Send a DM (verifies participation before writing) |

### Optimistic Updates
`MessageInput` uses TanStack React Query's `onMutate` to inject a temporary message into the store immediately. `onSuccess` replaces it with the real server response. `onError` removes it and shows a toast. Zero perceived latency.

### Presence
`usePresence(workspaceId, userId)` subscribes to a Supabase Presence channel scoped to the workspace. The full set of online user IDs is stored in `useChatStore.onlineUserIds` (a `Set<string>`). Green dots appear in the DM sidebar and the "New Chat" member picker.

### Realtime Scoping
`useRealtimeMessages` accepts either `channelId` or `conversationId`. The Supabase filter is strictly `channelId=eq.X` or `conversationId=eq.X` — no other threads' messages leak in. Messages from the current user are skipped (already in store via optimistic update).

### Infinite Scroll
Both channel and DM message lists use `useInfiniteQuery` with cursor-based pagination. Initial load: 50 messages. Scrolling to the top triggers `fetchNextPage`. No full-list re-renders.

---

## 13. Announcement System

### Two Tiers

**Workspace Announcements** (existing, enhanced)
- Posted by Manager/Admin/Owner roles in a specific workspace
- Visible only to that workspace's members
- Supports pinning, priority, expiry

**Global Announcements** (new)
- Posted by Super Admins (`User.isSuperAdmin = true`)
- Stored in the separate `GlobalAnnouncement` model (no `workspaceId`)
- Visible to all authenticated users across all workspaces
- Displayed on the "Global Updates" tab of the Announcements page

### Note → Announcement Sharing
A `Megaphone` button on each private note card opens a modal that:
1. Lists only workspaces where the user has Manager/Admin/Owner role
2. Lets the user set priority and pin before publishing
3. Calls `announcements.shareFromNote` which verifies the role server-side before creating the announcement and notifying workspace members

### UI
The Announcements page has two tabs:
- **Workspace Announcements** — scoped to the active workspace
- **Global Updates** — system-wide, with a badge showing the count

---

## 14. External Service Integrations

### Supabase
- **PostgreSQL** — Primary relational database
- **Auth** — Email/password + Google OAuth, JWT session management
- **Realtime** — WebSocket subscriptions on `Message` and `Notification` tables
- **Storage** — File uploads (avatars, document attachments, chat files)

### Upstash Redis
- **Rate Limiting** — Sliding window on auth endpoints
- **Caching** — Analytics query results (5-minute TTL)

### Resend
- **Invitation Email** — Sent when owner invites via email with branded template
- **Leave Approval Email** — Sent to employee on approve/reject
- **Welcome Email** — Sent on new user registration

### Vercel
- **Hosting** — Serverless Next.js deployment
- **CI/CD** — Auto-deploy on git push
- `prisma generate` runs before `next build` to ensure the Prisma client is always up to date

---

## 15. Security Model

### Authentication
- All sessions managed by Supabase Auth (JWT-based)
- Session refreshed on every request via `proxy.ts` middleware
- `getUser()` called server-side — never trusts client-provided user data

### Authorization
- Every tRPC procedure validates session in context
- Workspace membership verified on every workspace-scoped request
- Role checks enforced server-side via middleware tiers
- No client-side role checks are trusted — all enforced at the API layer

### Database Connection
- `DATABASE_URL` uses Transaction pooler (port 6543) with `pgbouncer=true&connection_limit=1`
- Prevents connection exhaustion on Vercel serverless functions
- `DIRECT_URL` uses Session mode (port 5432) for migrations only

### Data Validation
- All API inputs validated with Zod schemas before database operations
- No raw SQL — all queries through Prisma (parameterized, injection-safe)

---

## 16. Responsive Design

WorkNest is built mobile-first using Tailwind CSS v4 utility classes.

### Breakpoints
| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, drawer sidebar, stacked action rows |
| Tablet | 640–1024px | 2-column grids, collapsed sidebar |
| Desktop | > 1024px | Full layout, expanded sidebar, multi-column grids |

### Key Responsive Patterns
- **Sidebar** — Fixed on desktop, slide-in drawer on mobile (controlled by `useUIStore`)
- **AppShell** — `lg:pl-60` / `lg:pl-16` padding adjusts for sidebar state; `p-4 sm:p-6 lg:p-8` content padding
- **KPI Cards** — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- **Settings sections** — `flex-col sm:flex-row` for action rows that would overflow on mobile
- **Notes header** — `flex-col sm:flex-row` with `self-start` button alignment on mobile
- **Invite link rows** — `flex-wrap` meta badges, `truncate` on URL preview

---

## 17. Design System

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0A1828` | Page background |
| Surface | `#0D1F35` | Card backgrounds |
| Surface-2 | `#112540` | Elevated elements |
| Border | `#1E3A5F` | All borders |
| Primary | `#178582` | Turquoise — buttons, links, active states |
| Secondary | `#BFA181` | Gold — highlights, badges |
| Foreground | `#E8F0F8` | Primary text |
| Muted | `#7A9BBF` | Secondary text, placeholders |

### Typography
| Font | Role |
|------|------|
| **Syne** | Display / Headings (`font-syne`) |
| **DM Sans** | Body / UI (`font-sans`) |

---

## 18. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database — use Transaction pooler for runtime, Direct for migrations
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://..."

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

---

## 19. NPM Scripts

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # prisma generate + next build
npm run start        # Start production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check (no emit)
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed admin user + default workspace
npm run db:studio    # Open Prisma Studio (DB GUI)
npm run test         # Run unit tests
npm run test:e2e     # Run Playwright e2e tests
```

---

## 20. Landing Page & PWA

### Feedback Space
The mock testimonials section has been replaced with a live **Feedback Space** — a chat-style widget (`src/components/landing/FeedbackSpace.tsx`) where visitors can drop thoughts about WorkNest directly on the landing page.

Features:
- Three seed messages pre-populate the chat so it never looks empty
- Visitors enter an optional name, pick an emoji reaction, and type a message
- Messages animate in with Framer Motion and auto-scroll to the latest
- Emoji picker with 8 options (no external dependency)
- Character limit (200) and "just now / Xm ago" relative timestamps
- Fully client-side — no backend required; messages persist for the session

### Developer Footer
`src/components/landing/DeveloperFooter.tsx` replaces the generic link-grid footer with a personal credit section:
- Profile picture (`/public/profile.png`) with a green online indicator
- Developer name: **Kamashwara D K**
- Role tagline and tech stack
- GitHub and LinkedIn social links
- WorkNest brand mark on desktop
- Bottom bar with copyright and Sign In / Get Started links

### PWA (Progressive Web App)

WorkNest is installable as a home-screen app on any mobile device.

**Files added:**

| File | Description |
|------|-------------|
| `public/manifest.json` | Web App Manifest — name, icons, theme colour `#178582`, `start_url: /workspaces`, `display: standalone` |
| `public/sw.js` | Service Worker — pre-caches landing page and static assets, serves offline fallback, skips tRPC/Supabase API calls |
| `src/app/layout.tsx` | Registers SW via inline script, adds `apple-mobile-web-app-capable` and `theme-color` meta tags, exports `viewport` config |

**Install steps:**
- **Android Chrome** — ⋮ menu → "Add to Home screen"
- **iOS Safari** — Share (□↑) → "Add to Home Screen"
- **Desktop Chrome/Edge** — ⊕ icon in address bar → Install

**Icon generation** (required for full PWA score):
```bash
inkscape -w 192 -h 192 public/worknest-icon.svg -o public/icon-192.png
inkscape -w 512 -h 512 public/worknest-icon.svg -o public/icon-512.png
```

---

## 21. Future Scope

### Near-term
- **Video Conferencing** — Embed Jitsi Meet for in-app video calls
- **Time Tracking** — Log hours against tasks, weekly timesheets
- **Mobile App** — React Native with shared business logic
- **Advanced Search** — Full-text search across tasks, documents, messages

### Medium-term
- **AI Assistant** — Task suggestions, document summarization, smart leave conflict detection
- **Integrations** — GitHub (link commits to tasks), Google Calendar (sync leave dates)
- **Performance Reviews** — 360-degree feedback, OKR tracking
- **Workspace Templates** — Pre-configured channels, task boards, and roles

### Long-term
- **Multi-tenant White-label** — Custom branding per workspace
- **Workflow Automation** — Visual no-code workflow builder
- **Enterprise SSO** — SAML 2.0 / LDAP / Active Directory
- **Compliance Module** — SOC 2 logging, GDPR data export, audit trail

---

*WorkNest v0.2.0 — Built with Next.js 16, Supabase, tRPC, Prisma, and Tailwind CSS v4*
