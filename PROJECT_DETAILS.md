# WorkNest — Complete Project Documentation

> **"Your team's daily command center."**
> A full-featured internal employee productivity platform built for modern teams.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Who It's Built For](#2-who-its-built-for)
3. [Core Modules & Features](#3-core-modules--features)
4. [Tech Stack](#4-tech-stack)
5. [Libraries & Dependencies](#5-libraries--dependencies)
6. [Architecture & Connectivity](#6-architecture--connectivity)
7. [Database Schema](#7-database-schema)
8. [External Service Integrations](#8-external-service-integrations)
9. [Security Model](#9-security-model)
10. [Design System](#10-design-system)
11. [Who Benefits & How](#11-who-benefits--how)
12. [Future Scope](#12-future-scope)

---

## 1. Project Overview

WorkNest is a **unified internal productivity platform** that consolidates the tools a modern team uses every day into a single, cohesive interface. Instead of juggling Slack for chat, Jira for tasks, a separate HR portal for leaves, Google Docs for documents, and spreadsheets for analytics — WorkNest brings all of it under one roof.

| Property | Value |
|----------|-------|
| App Name | WorkNest |
| Version | 0.1.0 |
| Type | Full-Stack Web Application |
| Rendering | Server-Side + Client-Side (Hybrid) |
| Deployment Target | Vercel (Edge-compatible) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Email + Google OAuth) |
| Real-time | Supabase Realtime (WebSockets) |

---

## 2. Who It's Built For

### Primary Users

| Role | Description |
|------|-------------|
| **Employees** | Day-to-day task tracking, leave requests, team chat, document access |
| **Managers** | Leave approvals, task assignment, team oversight, announcements |
| **Admins** | Full platform control — user management, all data access, system configuration |

### Ideal Organizations

- **Startups (5–200 people)** — Replace 4–6 separate SaaS tools with one platform
- **SMEs (Small & Medium Enterprises)** — Affordable alternative to enterprise suites
- **Remote-first teams** — Async communication, document sharing, visibility across time zones
- **Agencies & consultancies** — Project tracking, client-facing team directories
- **Educational institutions** — Staff coordination, leave management, announcements
- **NGOs & non-profits** — Low-cost internal operations hub

### Pain Points Solved

- Scattered tools → one unified hub
- Leave approval via email chains → structured digital workflow
- No visibility into team workload → real-time Kanban + analytics
- Documents lost in email threads → versioned document hub
- No single source of truth for team info → searchable team directory

---

## 3. Core Modules & Features

### 3.1 Dashboard
- Personalized greeting with time-aware message
- 4 KPI cards: Open Tasks, Pending Leaves, Team Members, Completion Rate
- Animated count-up numbers on load
- Task completion donut chart (Recharts)
- Recent tasks feed
- Pinned announcements
- Pending leave requests (manager view)
- Quick-add task floating button

### 3.2 Task Management
- **Kanban Board** — 4 columns: To Do → In Progress → In Review → Done
- Drag-and-drop between columns (dnd-kit with spring physics)
- **List View** — sortable, filterable table (TanStack Table)
- Task cards: title, priority badge, assignee avatar, due date, tags
- Create/edit modal: full fields, tag input, assignee select, date picker
- Filter bar: by assignee, priority, status
- Global search across task titles
- Automatic notifications to assignees on task creation

### 3.3 Real-time Chat
- Channel-based messaging (public channels)
- Real-time message delivery via Supabase Realtime (WebSocket)
- Message grouping by sender + time proximity (5-minute window)
- File sharing via Supabase Storage
- Typing indicators via Supabase Presence
- Unread count badges per channel (Zustand)
- @mention support
- Message edit with timestamp

### 3.4 Leave Management
- Employee: submit leave requests (6 types: Sick, Casual, Earned, Maternity, Paternity, Unpaid)
- Date range picker, reason field, Zod validation
- Manager/Admin: approve or reject with comments
- Email notifications on approval/rejection (Resend)
- Leave distribution pie chart (Recharts)
- Leave history table with status badges
- Automatic notifications to all managers on new request

### 3.5 Document Hub
- Document grid with search and tag filtering
- **Tiptap rich-text editor** — headings, bold, italic, lists, code blocks, blockquotes, horizontal rules
- Auto-save every 30 seconds (debounced tRPC mutation)
- Version counter (increments on every save)
- Public/private toggle per document
- Tag management (add/remove inline)
- File attachment support via Supabase Storage
- Author attribution and relative timestamps

### 3.6 Team Directory
- Searchable grid of all active team members
- Department filter tabs
- Member cards: avatar, name, designation, department, role badge, online status
- Click-to-open profile drawer with full details
- Admin: activate/deactivate members

### 3.7 Announcements
- Pinned announcements highlighted at top
- Priority badges: URGENT (red), HIGH (amber), MEDIUM (blue), LOW (grey)
- Expiry date support (auto-hides expired announcements)
- Manager/Admin: create with rich text, priority, pin toggle, expiry
- Automatic notifications to all team members on publish

### 3.8 Analytics
- Date range selector: 7d / 30d / 90d
- KPI row: Total Tasks, Completion Rate, Active Members, Pending Leaves
- Task trend line chart (created vs completed over time)
- Tasks by priority stacked bar chart
- Leave distribution by type pie chart
- Team activity heatmap (GitHub-style, day × hour grid)
- Export to CSV (client-side via PapaParse)
- All charts animated on load (Recharts animation props)

### 3.9 Profile
- Avatar upload (Supabase Storage, 5MB limit, instant preview)
- Bio field (300 chars with live counter)
- Personal info: name, designation, department, phone
- Social links: LinkedIn, Twitter/X, GitHub, Website
- Stats: tasks assigned, leave requests, documents created
- Account info: email, role, member since date
- Unsaved changes indicator

### 3.10 Notifications
- Real-time notification delivery (Supabase Realtime)
- Subtle audio chime on new notification (Web Audio API)
- Slide-in notification panel from right
- Mark single / mark all as read
- Clear read notifications
- Unread badge on topbar bell icon

---

## 4. Tech Stack

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
| Supabase | PostgreSQL database + Auth + Realtime + Storage |
| Upstash Redis | Caching + Rate limiting |
| Resend | Transactional email |
| Vercel | Hosting + Edge deployment |

---

## 5. Libraries & Dependencies

### Core Framework
```
next@16.2.4              — React framework with App Router, Server Components
react@19.2.4             — UI library
typescript@^5            — Type safety (strict mode, no implicit any)
```

### Styling & UI
```
tailwindcss@^4           — Utility-first CSS with @theme CSS variables
tailwind-merge@^3        — Merge conflicting Tailwind classes safely
clsx@^2                  — Conditional className utility
class-variance-authority — Component variant system
tailwindcss-animate      — CSS animation utilities
framer-motion@^12        — Spring animations, page transitions, gestures
lucide-react@^1          — 1000+ consistent SVG icons
sonner@^2                — Toast notification system
```

### Radix UI Primitives (Accessible headless components)
```
@radix-ui/react-dialog          — Modal dialogs
@radix-ui/react-dropdown-menu   — Dropdown menus
@radix-ui/react-popover         — Floating popovers
@radix-ui/react-tooltip         — Hover tooltips
@radix-ui/react-tabs            — Tab navigation
@radix-ui/react-select          — Select dropdowns
@radix-ui/react-separator       — Visual dividers
@radix-ui/react-avatar          — Avatar with fallback
@radix-ui/react-scroll-area     — Custom scrollbars
@radix-ui/react-label           — Accessible form labels
@radix-ui/react-checkbox        — Accessible checkboxes
@radix-ui/react-slot            — Polymorphic component slot
cmdk@^1                         — Command palette (⌘K)
```

### Data & API
```
@trpc/server@^11         — Type-safe API router (server)
@trpc/client@^11         — Type-safe API client
@trpc/react-query@^11    — tRPC + React Query integration
@tanstack/react-query@^5 — Server state, caching, background refetch
@tanstack/react-table@^8 — Headless table with sort/filter/pagination
superjson@^2             — Serialize Date, Map, Set over JSON
```

### Database & Auth
```
prisma@^5                — Schema-first ORM, migrations, Prisma Studio
@prisma/client@^5        — Generated type-safe database client
@supabase/supabase-js@^2 — Supabase client (auth, storage, realtime)
@supabase/ssr@^0.10      — Supabase SSR helpers for Next.js App Router
```

### Forms & Validation
```
react-hook-form@^7       — Performant forms with minimal re-renders
@hookform/resolvers@^5   — Connect Zod schemas to React Hook Form
zod@^4                   — Schema validation (forms, API inputs)
```

### Rich Text Editor
```
@tiptap/react@^3         — Headless rich text editor framework
@tiptap/starter-kit@^3   — Bold, italic, headings, lists, code, blockquote
@tiptap/extension-image  — Image embedding
@tiptap/extension-link   — Hyperlink support
@tiptap/extension-placeholder — Placeholder text
```

### Charts & Data Visualization
```
recharts@^3              — Composable charts (Line, Bar, Pie, Area)
react-countup@^6         — Animated number count-up
```

### Drag & Drop
```
@dnd-kit/core@^6         — Drag-and-drop primitives
@dnd-kit/sortable@^10    — Sortable lists and grids
@dnd-kit/utilities@^3    — CSS transform utilities
```

### File Handling
```
react-dropzone@^15       — File upload with drag-and-drop
papaparse@^5             — CSV parsing and export
```

### Infrastructure SDKs
```
@upstash/redis@^1        — Serverless Redis client (REST API)
@upstash/ratelimit@^2    — Sliding window rate limiting
resend@^6                — Email delivery SDK
```

### Utilities
```
date-fns@^4              — Date formatting, arithmetic, intervals
dotenv@^17               — Environment variable loading
```

### Development & Testing
```
jest@^30                 — Unit test runner
@testing-library/react   — React component testing utilities
@testing-library/jest-dom — Custom DOM matchers
jest-environment-jsdom   — Browser-like test environment
@playwright/test@^1      — End-to-end browser testing
tsx@^4                   — TypeScript execution (for seed scripts)
ts-jest@^29              — TypeScript transformer for Jest
eslint@^9                — Code linting
eslint-config-next       — Next.js ESLint rules
```

---

## 6. Architecture & Connectivity

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                                                                 │
│  React 19 + Next.js App Router                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Zustand  │  │  React   │  │  Framer  │  │  Tiptap /    │   │
│  │  Stores  │  │  Query   │  │  Motion  │  │  Recharts /  │   │
│  │ (UI/Chat │  │  Cache   │  │  Anim.   │  │  dnd-kit     │   │
│  │  /Notif) │  │          │  │          │  │              │   │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └──────────────┘   │
│       │              │                                          │
│       └──────────────┼──────────────────────────────────────   │
│                      │ tRPC HTTP Batch                          │
└──────────────────────┼──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    NEXT.JS SERVER (Vercel)                       │
│                                                                 │
│  App Router (Server Components + Server Actions)                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    tRPC Router                          │   │
│  │  /api/trpc/[trpc]                                       │   │
│  │                                                         │   │
│  │  tasks | chat | leaves | documents | users |            │   │
│  │  announcements | notifications | analytics              │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │                  Prisma ORM v5                          │   │
│  │  Type-safe queries → PostgreSQL                         │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │              Supabase Auth (SSR)                        │   │
│  │  Session validation on every tRPC request               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  proxy.ts (Next.js Proxy/Middleware)                            │
│  → Refreshes Supabase session cookies                           │
│  → Redirects unauthenticated → /login                          │
│  → Redirects authenticated from /login → /dashboard            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────────────────────┐
        │              │                              │
┌───────▼──────┐ ┌─────▼──────────┐ ┌───────────────▼──────┐
│  Supabase    │ │  Upstash Redis │ │      Resend          │
│              │ │                │ │                      │
│ • PostgreSQL │ │ • Query cache  │ │ • Welcome emails     │
│ • Auth       │ │ • Rate limits  │ │ • Leave approval     │
│ • Realtime   │ │   (5 req/min)  │ │   notifications      │
│ • Storage    │ └────────────────┘ └──────────────────────┘
│              │
│ WebSocket ───┼──→ Browser (Realtime)
│  • Messages  │    • New messages append instantly
│  • Notifs    │    • Notification badge updates live
└──────────────┘
```

### Data Flow — Real-time Chat
```
User types message
  → React Hook Form captures input
  → tRPC mutation: chat.messages.send
  → Prisma inserts to PostgreSQL
  → Supabase Realtime broadcasts INSERT event
  → All subscribed clients receive via WebSocket
  → React Query cache updated
  → MessageList re-renders with new message
```

### Data Flow — Authentication
```
User clicks "Continue with Google"
  → Supabase OAuth redirect to Google
  → Google authenticates, redirects to /auth/callback
  → Supabase exchanges code for session
  → /auth/callback route creates DB user if new
  → Session cookie set
  → proxy.ts validates session on every request
  → tRPC context attaches user to every procedure
```

### Data Flow — Leave Approval
```
Employee submits leave request
  → tRPC: leaves.request mutation
  → Prisma creates LeaveRequest record
  → Notifications created for all managers
  → Supabase Realtime pushes notification to managers
  
Manager clicks Approve
  → tRPC: leaves.approve mutation (managerProcedure guard)
  → Prisma updates status to APPROVED
  → Notification created for employee
  → Resend sends approval email to employee
```

---

## 7. Database Schema

### Models Overview

```
User ──────────────────────────────────────────────────────────
  id, supabaseId, email, name, avatar, role (ADMIN|MANAGER|EMPLOYEE)
  department, designation, phone, bio
  linkedinUrl, twitterUrl, githubUrl, websiteUrl
  joinedAt, isActive, createdAt, updatedAt

Task ──────────────────────────────────────────────────────────
  id, title, description
  status (TODO|IN_PROGRESS|IN_REVIEW|DONE)
  priority (LOW|MEDIUM|HIGH|URGENT)
  dueDate, order, tags[], attachments[]
  assigneeId → User, creatorId → User

LeaveRequest ──────────────────────────────────────────────────
  id, userId → User
  type (SICK|CASUAL|EARNED|MATERNITY|PATERNITY|UNPAID)
  startDate, endDate, reason
  status (PENDING|APPROVED|REJECTED|CANCELLED)
  approvedBy, comments

Message ───────────────────────────────────────────────────────
  id, channelId → Channel, senderId → User
  content, type (TEXT|IMAGE|FILE), fileUrl
  createdAt, editedAt

Channel ───────────────────────────────────────────────────────
  id, name (unique), description, isPrivate

Document ──────────────────────────────────────────────────────
  id, title, content (Text), authorId → User
  isPublic, tags[], fileUrl, version

Announcement ──────────────────────────────────────────────────
  id, title, body (Text), authorId
  priority, pinned, expiresAt

Notification ──────────────────────────────────────────────────
  id, userId → User, title, body, type, read, link
```

### Role-Based Access Control

| Action | EMPLOYEE | MANAGER | ADMIN |
|--------|----------|---------|-------|
| View own tasks | ✅ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ |
| Assign tasks to others | ✅ | ✅ | ✅ |
| Request leave | ✅ | ✅ | ✅ |
| Approve/reject leave | ❌ | ✅ | ✅ |
| Create announcements | ❌ | ✅ | ✅ |
| View all leave requests | ❌ | ✅ | ✅ |
| Deactivate users | ❌ | ❌ | ✅ |
| Delete announcements | ❌ | ✅ | ✅ |

---

## 8. External Service Integrations

### Supabase
- **PostgreSQL** — Primary relational database (hosted, managed)
- **Auth** — Email/password + Google OAuth, JWT session management
- **Realtime** — WebSocket subscriptions on `Message` and `Notification` tables
- **Storage** — File uploads (avatars, document attachments, chat files)
- **SSR Helpers** — Cookie-based session management for Next.js App Router

### Upstash Redis
- **Caching** — Analytics query results cached with 5-minute TTL
- **Rate Limiting** — Sliding window: 5 requests/minute per IP on auth endpoints
- **Serverless-friendly** — REST API, no persistent connection needed

### Resend
- **Welcome Email** — Sent on new user registration with branded HTML template
- **Leave Approval Email** — Sent to employee when leave is approved or rejected
- **Branded templates** — Custom HTML with WorkNest color theme

### Vercel
- **Hosting** — Serverless Next.js deployment
- **Edge Network** — Global CDN for static assets
- **Environment Variables** — Secure secrets management
- **CI/CD** — Auto-deploy on git push via GitHub integration

### Google OAuth (via Supabase)
- Single Sign-On with Google accounts
- Automatic profile picture import
- No password management needed for Google users

---

## 9. Security Model

### Authentication
- All sessions managed by Supabase Auth (JWT-based)
- Session refreshed on every request via `proxy.ts`
- `getUser()` called server-side — never trusts client-provided user data
- Google OAuth uses PKCE flow (no client secret exposed)

### Authorization
- Every tRPC procedure validates session in context
- Role checks enforced server-side (`protectedProcedure`, `managerProcedure`, `adminProcedure`)
- Document access: private docs only accessible by author
- Leave approval: only MANAGER or ADMIN roles can approve/reject

### Rate Limiting
- Auth endpoints: 5 requests/minute per IP (Upstash Ratelimit)
- Prevents brute-force attacks on login/register

### Data Validation
- All API inputs validated with Zod schemas before database operations
- No raw SQL — all queries through Prisma (parameterized, injection-safe)
- File uploads: type and size validated before Supabase Storage upload

### Environment Security
- All secrets in `.env.local` (never committed)
- Service role key only used server-side
- Publishable/anon key safe for client-side use

---

## 10. Design System

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0A1828` | Page background (dark classic blue) |
| Surface | `#0D1F35` | Card backgrounds |
| Surface-2 | `#112540` | Elevated elements |
| Surface-3 | `#152B4A` | Highest elevation |
| Border | `#1E3A5F` | All borders |
| Primary | `#178582` | Turquoise — buttons, links, active states |
| Secondary | `#BFA181` | Gold — highlights, badges |
| Accent | `#D4B896` | Light gold — secondary highlights |
| Foreground | `#E8F0F8` | Primary text |
| Muted | `#7A9BBF` | Secondary text, placeholders |

### Typography
| Font | Role | Weights |
|------|------|---------|
| **Syne** | Display / Headings | 400, 500, 600, 700, 800 |
| **DM Sans** | Body / UI | 300, 400, 500, 600, 700 |

### Animation System (Framer Motion)
| Variant | Effect | Use Case |
|---------|--------|----------|
| `fadeUp` | y: 24→0, opacity: 0→1 | Section reveals, cards |
| `staggerContainer` | 70ms child stagger | Card grids, lists |
| `scaleIn` | scale: 0.95→1 | Modals, auth forms |
| `slideRight` | x: -20→0 | Chat messages, sidebar items |
| `pageTransition` | opacity + y slide | Route changes |
| `drawerVariants` | x: -100%→0 | Mobile sidebar |
| `notificationPanel` | x: 100%→0 | Notification panel |

### Responsive Breakpoints
| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, drawer sidebar, horizontal scroll Kanban |
| Tablet | 768–1024px | 2-column grids, collapsed sidebar |
| Desktop | > 1024px | Full layout, expanded sidebar, multi-column grids |

---

## 11. Who Benefits & How

### Employees
- **Save 30–60 min/day** — No context switching between tools
- **Never miss a task** — Assigned tasks trigger instant notifications
- **Transparent leave process** — Submit and track requests digitally
- **Stay informed** — Announcements and notifications in one place
- **Build a professional profile** — Bio, social links, visible to the team

### Managers
- **Real-time team visibility** — See all tasks, statuses, and workloads
- **Streamlined approvals** — Leave requests with one-click approve/reject
- **Broadcast updates** — Announcements reach the whole team instantly
- **Data-driven decisions** — Analytics dashboard with completion rates and trends

### HR Departments
- **Digital leave records** — All requests, approvals, and history stored
- **Leave type tracking** — Sick, casual, earned, maternity, paternity, unpaid
- **Compliance-ready** — Timestamped records with approver attribution

### IT / Operations
- **Single platform to maintain** — One deployment, one database
- **Role-based access** — No manual permission management
- **Audit trail** — All actions timestamped and attributed

### Leadership / C-Suite
- **Analytics at a glance** — Task completion rates, team activity heatmaps
- **Productivity trends** — 7d / 30d / 90d views
- **Team health indicators** — Leave patterns, pending requests

---

## 12. Future Scope

### Near-term (3–6 months)

#### 1. Video Conferencing Integration
- Embed Jitsi Meet or Daily.co for in-app video calls
- Schedule meetings from the calendar
- Meeting notes auto-saved to Documents

#### 2. Time Tracking
- Log hours against tasks
- Weekly timesheets with manager approval
- Integration with payroll exports (CSV)

#### 3. Project Management Layer
- Group tasks into Projects with milestones
- Gantt chart view (timeline)
- Project-level analytics and burn-down charts

#### 4. Mobile App (React Native)
- Shared business logic with the web app
- Push notifications (FCM)
- Offline-first with sync on reconnect

#### 5. Advanced Search
- Full-text search across tasks, documents, messages, and announcements
- Powered by PostgreSQL full-text search or Algolia

---

### Medium-term (6–12 months)

#### 6. AI Assistant Integration
- AI-powered task suggestions based on workload
- Auto-summarize long document threads
- Smart leave conflict detection
- Natural language task creation ("Create a high-priority task for Sarah due Friday")

#### 7. Integrations Marketplace
- Slack import/export
- GitHub — link commits to tasks
- Google Calendar — sync leave dates
- Zapier / Make webhooks for custom automations

#### 8. Performance Reviews
- 360-degree feedback cycles
- Goal setting (OKRs) linked to tasks
- Review history and progression tracking

#### 9. Payroll & HR Module
- Salary slips generation
- Attendance tracking (check-in/check-out)
- Holiday calendar management
- Compliance reports

#### 10. Multi-tenant / White-label
- Multiple organizations on one deployment
- Custom branding per organization (logo, colors)
- Subdomain routing (`company.worknest.app`)

---

### Long-term (12+ months)

#### 11. Workflow Automation Engine
- Visual workflow builder (no-code)
- Trigger: "When leave is approved → notify team → block calendar"
- Custom approval chains for different leave types

#### 12. Advanced Analytics & BI
- Custom report builder
- Export to PDF / Excel
- Scheduled email reports to leadership
- Predictive analytics (burnout risk, attrition signals)

#### 13. Compliance & Audit Module
- SOC 2 compliance logging
- GDPR data export / right to erasure
- Immutable audit trail for all sensitive actions

#### 14. Marketplace / Plugin System
- Third-party developers can build plugins
- Plugin store with install/uninstall
- Sandboxed execution environment

#### 15. Enterprise Features
- SSO via SAML 2.0 / LDAP / Active Directory
- IP allowlisting
- Data residency options (EU, US, APAC)
- SLA-backed uptime guarantees
- Dedicated support channels

---

## Quick Reference

### Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  # Supabase publishable key
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anon key (fallback)
SUPABASE_SERVICE_ROLE_KEY         # Server-only service role key
DATABASE_URL                      # PostgreSQL connection string
DIRECT_URL                        # Direct PostgreSQL (for migrations)
UPSTASH_REDIS_REST_URL            # Upstash Redis REST endpoint
UPSTASH_REDIS_REST_TOKEN          # Upstash Redis auth token
RESEND_API_KEY                    # Resend email API key
RESEND_FROM_EMAIL                 # Sender email address
NEXT_PUBLIC_APP_URL               # App base URL
```

### NPM Scripts
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check (no emit)
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (DB GUI)
npm run test         # Run unit tests
npm run test:e2e     # Run Playwright e2e tests
```

### Demo Accounts (after seeding)
```
Admin:    admin@worknest.app
Manager:  manager@worknest.app
Employee: sarah@worknest.app
Employee: james@worknest.app
Employee: priya@worknest.app
```

---

*WorkNest v0.1.0 — Built with Next.js 16, Supabase, tRPC, Prisma, and Tailwind CSS v4*
