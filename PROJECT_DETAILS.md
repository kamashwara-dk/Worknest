# WorkNest — Complete Project Documentation

> **"Your team's daily command center."**
> A full-featured, multi-tenant internal productivity platform built for modern teams.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What's New in v0.2](#2-whats-new-in-v02)
3. [Who It's Built For](#3-who-its-built-for)
4. [Core Modules & Features](#4-core-modules--features)
5. [Tech Stack](#5-tech-stack)
6. [Architecture & Connectivity](#6-architecture--connectivity)
7. [Database Schema](#7-database-schema)
8. [Multi-Tenant System](#8-multi-tenant-system)
9. [Role-Based Access Control](#9-role-based-access-control)
10. [Invitation System](#10-invitation-system)
11. [Private Notes](#11-private-notes)
12. [External Service Integrations](#12-external-service-integrations)
13. [Security Model](#13-security-model)
14. [Responsive Design](#14-responsive-design)
15. [Design System](#15-design-system)
16. [Environment Variables](#16-environment-variables)
17. [NPM Scripts](#17-npm-scripts)
18. [Future Scope](#18-future-scope)

---

## 1. Project Overview

WorkNest is a **unified internal productivity platform** that consolidates the tools a modern team uses every day into a single, cohesive interface. Instead of juggling Slack for chat, Jira for tasks, a separate HR portal for leaves, Google Docs for documents, and spreadsheets for analytics — WorkNest brings all of it under one roof.

| Property | Value |
|----------|-------|
| App Name | WorkNest |
| Version | 0.2.0 |
| Type | Full-Stack Web Application |
| Rendering | Server-Side + Client-Side (Hybrid) |
| Deployment Target | Vercel (Edge-compatible) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Email + Google OAuth) |
| Real-time | Supabase Realtime (WebSockets) |
| Multi-tenancy | Workspace-scoped data isolation |

---

## 2. What's New in v0.2

### Multi-Tenant Workspaces
Every user can create one or more private **workspaces**. All data — tasks, channels, messages, documents, leave requests, announcements, and notifications — is fully isolated per workspace. A user can belong to multiple workspaces simultaneously and switch between them from the workspace picker.

### Workspace Join Code
Each workspace has a unique human-readable `XXX-XXX` alphanumeric code (e.g. `TTS-KUW`). The workspace owner can share this code verbally or in a message. Any authenticated user can enter it on the "Join a Workspace" tab to become a member instantly. Owners can regenerate or disable the code at any time from Settings.

### Reusable Invite Links
Owners can generate shareable `/invite/[token]` URLs from the Settings page. Each link supports:
- Optional **label** (e.g. "Engineering team")
- Optional **max uses** (auto-deactivates when reached)
- Optional **expiry date**
- Manual deactivation or deletion

Any authenticated user who visits the link can join the workspace as a Member.

### Role-Based Access Control (RBAC)
Four workspace roles with strict server-side enforcement:

| Role | Description |
|------|-------------|
| **Owner** | Full control — invite tools, delete workspace, all admin actions |
| **Admin** | Manage members, update workspace settings |
| **Manager** | Approve leaves, create announcements |
| **Member** | Standard access — tasks, chat, documents, leaves |

Invite tools (join code + invite links) are exclusively visible to and usable by the **Owner**. The backend enforces this via a dedicated `workspaceOwnerProcedure` middleware that throws `FORBIDDEN` for any other role.

### Private Notes
Each authenticated user has a personal note-taking dashboard at `/notes`. Notes are:
- **Completely private** — never shared with workspace members
- **Not workspace-scoped** — accessible regardless of which workspace is active
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

## 12. External Service Integrations

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

## 13. Security Model

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

## 14. Responsive Design

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

## 15. Design System

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

## 16. Environment Variables

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

## 17. NPM Scripts

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

## 18. Future Scope

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
