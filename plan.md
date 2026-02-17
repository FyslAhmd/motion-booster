# Software Agency Client Management SaaS Platform

## Project Plan & Implementation Guide

**Version:** 1.0
**Date:** February 2026
**Stack:** Next.js 16 (Monorepo) · PostgreSQL · Redis · Socket.IO · AWS S3

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Current State Analysis](#current-state-analysis)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Phase 0: Cleanup & Foundation](#phase-0-cleanup--foundation)
- [Phase 1: Database Design](#phase-1-database-design-postgresql--redis)
- [Phase 2: Authentication & Security](#phase-2-authentication--security-system)
- [Phase 3: Meta Ads Integration](#phase-3-meta-ads-integration)
- [Phase 4: Real-time Messaging](#phase-4-real-time-messaging-system)
- [Phase 5: File Sharing](#phase-5-file-sharing-system)
- [Phase 6: Frontend Development](#phase-6-frontend-development)
- [Phase 7: Error Handling & Logging](#phase-7-error-handling--logging)
- [Phase 8: Testing](#phase-8-testing)
- [Phase 9: Deployment & DevOps](#phase-9-deployment--devops)
- [Implementation Order](#implementation-order-priority-sequence)
- [Security Checklist](#security-checklist-cross-cutting)
- [Error Code Catalog](#error-code-catalog)
- [Key Architectural Decisions](#key-architectural-decisions)
- [Verification Criteria](#verification-criteria)

---

## Executive Summary

Build a high-security SaaS platform using **Next.js 16 (monorepo)** with API Routes + Server Actions for the core backend, **PostgreSQL** for persistent data, **Redis** for caching/sessions/rate-limiting, **Socket.IO** as a separate microservice for real-time messaging, and **Meta Marketing API** for ad spend data.

**Deployment targets:**
- Next.js app → **Vercel**
- Socket.IO server + PostgreSQL + Redis → **Railway/Render**
- File storage → **AWS S3**

**Core principle:** Security is the top priority throughout — every layer implements defense-in-depth: bcrypt password hashing, JWT access/refresh tokens with rotation, RBAC middleware, CSRF protection, input validation with Zod, rate limiting via Redis, encrypted OAuth tokens at rest, and comprehensive error handling that never leaks internals.

---

## Current State Analysis

### What Exists

| Area | Status | Details |
|------|--------|---------|
| Landing page | **UI only** | 8 sections (Hero, Features, Companies, Upgrade, Automate, Testimonials, FAQ, CTA) — all static, hardcoded data |
| Auth pages | **UI only** | Login, Register, Forgot Password — forms `console.log` on submit, no validation beyond HTML `required` |
| Navigation | **Partially broken** | Anchor links (`#features`, `#blog`, `#contact`) but no section `id` attributes |
| State management | **None** | All state is component-local `useState` |
| Backend/API | **None** | No `app/api/` directory, no server logic |
| Authentication | **None** | No auth context, no middleware, no protected routes |
| Database | **None** | No database connection |
| Real-time | **None** | No WebSocket/Socket.IO |
| File handling | **None** | No upload/download |
| Meta Ads | **None** | No integration |
| Testing | **None** | No test framework configured |
| Error handling | **None** | No error boundaries, no loading states, no 404/error pages |

### Issues to Fix

| Issue | Location | Type |
|-------|----------|------|
| "GoSaas" branding | `Companies.tsx`, `Testimonials.tsx` | Branding |
| "HubSpot" reference | `Upgrade.tsx` | Branding |
| "Rareblocks" + "gosass.com" | `Automate.tsx` | Branding |
| "Laralink" in copyright | `Footer.tsx` | Branding |
| "Elevate Ur" typo | `Hero.tsx` | Typo |
| Duplicate feature cards | `Features.tsx` (3 identical "Contact Management") | Data |
| Missing section `id` attributes | All section components | Navigation |
| `hasDropdown` dead code | `Header.tsx` | Dead code |
| Unused types | `types/index.ts` | Unused code |
| `cn()` utility unused | `lib/utils.ts` | Unused code |
| `autoprefixer` in prod deps | `package.json` | Config |
| Header/Footer on auth pages | `app/layout.tsx` (global layout) | UX |

### Current Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | `16.1.6` | App framework |
| `react` | `19.2.3` | UI library |
| `react-dom` | `19.2.3` | React DOM |
| `clsx` | `^2.1.1` | Conditional classNames |
| `tailwindcss` | `^4` (dev) | Styling |
| `typescript` | `^5` (dev) | Type safety |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                         CLIENTS                              │
│                  (Browser / Mobile Web)                       │
└──────────┬──────────────────────────┬────────────────────────┘
           │ HTTPS                    │ WSS
           ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐
│   Next.js 16 App    │    │  Socket.IO Server   │
│   (Vercel)          │    │  (Railway/Render)    │
│                     │    │                      │
│  ┌───────────────┐  │    │  • JWT auth on conn  │
│  │ App Router    │  │    │  • Text messaging    │
│  │ (Pages + API) │  │    │  • Typing indicators │
│  └───────────────┘  │    │  • Notifications     │
│  ┌───────────────┐  │    │  • Voice msg notify  │
│  │ Middleware    │  │    └──────────┬───────────┘
│  │ (Auth/CSRF/  │  │               │
│  │  Rate Limit) │  │               │
│  └───────────────┘  │               │
│  ┌───────────────┐  │               │
│  │ API Routes   │  │               │
│  │ /api/v1/*    │  │               │
│  └───────────────┘  │               │
└──────────┬──────────┘               │
           │                          │
     ┌─────┼──────────────────────────┼─────┐
     │     ▼                          ▼     │
     │  ┌─────────────┐  ┌──────────────┐  │
     │  │ PostgreSQL  │  │    Redis     │  │
     │  │ (Railway/   │  │  (Railway/   │  │
     │  │  Neon)      │  │   Upstash)   │  │
     │  │             │  │              │  │
     │  │ • Users     │  │ • Rate limit │  │
     │  │ • Messages  │  │ • Sessions   │  │
     │  │ • Files     │  │ • Cache      │  │
     │  │ • Ad data   │  │ • CSRF       │  │
     │  │ • Audit log │  │ • Typing     │  │
     │  └─────────────┘  └──────────────┘  │
     │         DATABASE LAYER               │
     └──────────────────────────────────────┘
           │
           │
     ┌─────┼──────────────────────────┐
     │     ▼                          │
     │  ┌─────────────┐  ┌────────┐  │
     │  │   AWS S3    │  │  Meta  │  │
     │  │             │  │  Ads   │  │
     │  │ • Files     │  │  API   │  │
     │  │ • Voice msg │  │        │  │
     │  │ • Avatars   │  │        │  │
     │  └─────────────┘  └────────┘  │
     │      EXTERNAL SERVICES         │
     └────────────────────────────────┘
```

---

## Project Structure

```
motion-booster/
├── app/
│   ├── (marketing)/                # Landing page group (with Header/Footer)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (auth)/                     # Auth pages (NO Header/Footer)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (dashboard)/                # Protected app pages
│   │   ├── layout.tsx              # Sidebar + TopBar layout
│   │   ├── dashboard/page.tsx      # Client/Admin dashboard
│   │   ├── messages/page.tsx       # Messaging interface
│   │   ├── files/page.tsx          # File manager
│   │   ├── ads/page.tsx            # Meta Ads spending view
│   │   ├── settings/page.tsx       # User settings
│   │   └── admin/                  # Admin-only routes
│   │       ├── clients/page.tsx
│   │       ├── clients/[id]/page.tsx
│   │       └── settings/page.tsx
│   ├── api/                        # API Routes
│   │   └── v1/
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   ├── refresh/route.ts
│   │       │   ├── verify-email/route.ts
│   │       │   ├── forgot-password/route.ts
│   │       │   └── reset-password/route.ts
│   │       ├── users/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   └── me/route.ts
│   │       ├── meta/
│   │       │   ├── connect/route.ts
│   │       │   ├── callback/route.ts
│   │       │   └── disconnect/route.ts
│   │       ├── ads/
│   │       │   ├── overview/route.ts
│   │       │   ├── campaigns/route.ts
│   │       │   ├── spending/route.ts
│   │       │   └── export/route.ts
│   │       ├── messages/
│   │       │   ├── route.ts
│   │       │   └── [conversationId]/route.ts
│   │       ├── files/
│   │       │   ├── presign/route.ts
│   │       │   ├── confirm/route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── download/route.ts
│   │       └── admin/
│   │           ├── clients/route.ts
│   │           ├── clients/[id]/route.ts
│   │           └── audit-logs/route.ts
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── loading.tsx
│   ├── layout.tsx                  # Root layout (minimal, no header/footer)
│   └── globals.css
├── components/
│   ├── layout/                     # Site-wide layout
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   ├── sections/                   # Landing page sections
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Companies.tsx
│   │   ├── Upgrade.tsx
│   │   ├── Automate.tsx
│   │   ├── Testimonials.tsx
│   │   ├── FAQ.tsx
│   │   ├── CTA.tsx
│   │   └── index.ts
│   ├── ui/                         # Reusable UI primitives (shadcn/ui)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Dialog.tsx
│   │   ├── DropdownMenu.tsx
│   │   ├── Sheet.tsx
│   │   ├── Tabs.tsx
│   │   ├── Toast.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts
│   ├── dashboard/                  # Dashboard components
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── StatsCard.tsx
│   │   ├── SpendingChart.tsx
│   │   ├── CampaignTable.tsx
│   │   ├── RecentMessages.tsx
│   │   ├── RecentFiles.tsx
│   │   └── index.ts
│   ├── messages/                   # Messaging components
│   │   ├── ConversationList.tsx
│   │   ├── ChatView.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── VoiceRecorder.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── index.ts
│   ├── files/                      # File management components
│   │   ├── FileGrid.tsx
│   │   ├── FileList.tsx
│   │   ├── FileUploadZone.tsx
│   │   ├── FilePreview.tsx
│   │   ├── FileDetails.tsx
│   │   └── index.ts
│   └── ads/                        # Ad spend components
│       ├── SpendOverview.tsx
│       ├── CampaignBreakdown.tsx
│       ├── SpendingTrends.tsx
│       ├── DateRangePicker.tsx
│       ├── ExportButton.tsx
│       └── index.ts
├── lib/
│   ├── utils.ts                    # cn() utility
│   ├── constants.ts                # App-wide constants
│   ├── db/                         # Database layer
│   │   ├── prisma.ts               # Prisma client singleton
│   │   └── queries/                # Reusable query functions
│   │       ├── users.ts
│   │       ├── messages.ts
│   │       ├── files.ts
│   │       └── ads.ts
│   ├── auth/                       # Authentication
│   │   ├── config.ts               # Auth.js configuration
│   │   ├── tokens.ts               # JWT generation/verification
│   │   ├── password.ts             # bcrypt hashing/comparison
│   │   └── session.ts              # Session management
│   ├── redis/                      # Redis client
│   │   ├── client.ts               # Redis connection
│   │   ├── rate-limit.ts           # Rate limiting functions
│   │   └── cache.ts                # Caching helpers
│   ├── meta/                       # Meta Ads integration
│   │   ├── oauth.ts                # OAuth 2.0 flow
│   │   ├── api.ts                  # Meta Marketing API client
│   │   └── cache.ts                # Ad data caching logic
│   ├── s3/                         # AWS S3 integration
│   │   ├── client.ts               # S3 client
│   │   ├── presign.ts              # Presigned URL generation
│   │   └── operations.ts           # Upload/download helpers
│   ├── email/                      # Email service
│   │   ├── client.ts               # Nodemailer transport
│   │   └── templates/              # Email templates
│   │       ├── verify-email.ts
│   │       ├── reset-password.ts
│   │       └── notification.ts
│   ├── validators/                 # Zod validation schemas
│   │   ├── auth.ts                 # Auth-related schemas
│   │   ├── user.ts                 # User-related schemas
│   │   ├── message.ts              # Message schemas
│   │   ├── file.ts                 # File schemas
│   │   └── common.ts               # Shared schemas (pagination, etc.)
│   ├── security/                   # Security utilities
│   │   ├── encryption.ts           # AES-256-GCM encrypt/decrypt
│   │   ├── csrf.ts                 # CSRF token generation/validation
│   │   ├── sanitize.ts             # Input sanitization
│   │   ├── audit.ts                # Audit logging
│   │   └── headers.ts              # Security headers config
│   └── errors/                     # Error handling
│       ├── AppError.ts             # Base error class
│       ├── codes.ts                # Error code catalog
│       ├── handler.ts              # Global error handler
│       └── types.ts                # Error types
├── middleware.ts                   # Next.js Edge Middleware
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── seed.ts                     # Seed data
│   └── migrations/                 # Migration history
├── socket-server/                  # Separate Socket.IO microservice
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── src/
│       ├── index.ts                # Server entry point
│       ├── auth.ts                 # JWT verification
│       ├── handlers/
│       │   ├── chat.ts             # Message handlers
│       │   ├── typing.ts           # Typing indicators
│       │   └── notification.ts     # Notification handlers
│       └── middleware/
│           ├── auth.ts             # Socket auth middleware
│           └── rate-limit.ts       # Socket rate limiting
├── stores/                         # Zustand state management
│   ├── auth-store.ts
│   ├── message-store.ts
│   ├── notification-store.ts
│   └── file-store.ts
├── hooks/                          # Custom React hooks
│   ├── use-auth.ts
│   ├── use-socket.ts
│   ├── use-messages.ts
│   ├── use-files.ts
│   └── use-media-recorder.ts
├── types/
│   ├── index.ts                    # Shared types
│   ├── api.ts                      # API request/response types
│   ├── database.ts                 # Database model types
│   └── socket.ts                   # Socket event types
├── public/
│   └── images/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example                    # Environment variable template
├── .env.local                      # Local environment (git-ignored)
├── plan.md                         # This file
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Phase 0: Cleanup & Foundation

**Goal:** Fix all template artifacts, reorganize the project structure, and install core dependencies.

### 0.1 — Fix Branding & Template Artifacts

| File | Fix |
|------|-----|
| `components/sections/Companies.tsx` | Replace "GoSaas" → "MotionBooster" |
| `components/sections/Testimonials.tsx` | Replace "Gosass" → "MotionBooster" in all review texts |
| `components/sections/Upgrade.tsx` | Remove "HubSpot" reference, replace with MotionBooster copy |
| `components/sections/Automate.tsx` | Remove "Rareblocks" and "gosass.com" references |
| `components/layout/Footer.tsx` | Replace "Laralink" → "MotionBooster" in copyright |
| `components/sections/Hero.tsx` | Fix "Elevate Ur" → "Elevate Your" |
| `components/sections/Features.tsx` | Replace 3 duplicate "Contact Management" cards with unique features |

### 0.2 — Fix Navigation & Section IDs

Add `id` attributes to all landing page sections:

| Section | ID |
|---------|----|
| Hero | `#hero` |
| Features | `#features` |
| Companies | `#companies` |
| Upgrade | `#upgrade` |
| Automate | `#automate` |
| Testimonials | `#testimonials` |
| FAQ | `#faq` |
| CTA | `#cta` |

Update Header nav links to point to correct anchors.

### 0.3 — Restructure Routing with Route Groups

- `(marketing)` group → Landing page with Header/Footer layout
- `(auth)` group → Auth pages with dedicated minimal layout (NO Header/Footer)
- `(dashboard)` group → Protected app pages with Sidebar/TopBar layout

### 0.4 — Install Core Dependencies

**Production:**
```bash
npm install prisma @prisma/client ioredis next-auth@5 @auth/prisma-adapter \
  bcryptjs zod @aws-sdk/client-s3 @aws-sdk/s3-request-presigner \
  zustand recharts lucide-react react-hook-form @hookform/resolvers \
  jose nanoid date-fns sonner pino sharp nodemailer
```

**Dev:**
```bash
npm install -D @types/bcryptjs @types/nodemailer vitest @testing-library/react \
  @testing-library/jest-dom playwright @playwright/test prisma
```

**Socket.IO server (separate package.json):**
```bash
npm install socket.io ioredis jose cors dotenv
npm install -D typescript @types/node tsx
```

### 0.5 — Environment Variables Setup

Create `.env.example`:
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/motionbooster?schema=public"

# Redis
REDIS_URL="redis://default:pass@host:6379"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
JWT_SECRET="generate-with-openssl-rand-base64-32"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Meta Ads
META_APP_ID=""
META_APP_SECRET=""
META_REDIRECT_URI=""

# AWS S3
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""
AWS_S3_REGION="us-east-1"

# Email (SMTP)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="noreply@motionbooster.com"

# Encryption
ENCRYPTION_KEY="generate-with-openssl-rand-hex-32"

# Socket.IO Server
SOCKET_SERVER_URL="http://localhost:3001"

# Monitoring
SENTRY_DSN=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
NODE_ENV="development"
```

---

## Phase 1: Database Design (PostgreSQL + Redis)

### 1.1 — Why PostgreSQL + Redis

**PostgreSQL over MongoDB:**

| Criteria | PostgreSQL | MongoDB |
|----------|-----------|---------|
| Data relationships | Foreign keys, JOINs — users ↔ messages ↔ files ↔ ad_accounts | Manual references, no enforced integrity |
| Transactions | ACID-compliant — critical for auth flows, token rotation | Limited multi-document transactions |
| Security | Row-Level Security (RLS) policies — defense-in-depth | No built-in RLS |
| Financial data | Strong typing, decimal precision for ad spend amounts | Floating point issues possible |
| Full-text search | Built-in GIN indexes for message search | Requires Atlas Search (paid) |
| Audit compliance | Triggers for change tracking | Change streams (more complex) |
| ORM support | Prisma — type-safe, auto-migrations, excellent DX | Mongoose — less type safety |

**Redis as companion:**

| Use Case | Why Redis | TTL |
|----------|----------|-----|
| Rate limiting | O(1) sliding window counters | 1-15 min |
| Session cache | Sub-millisecond read for auth checks | 1 hour |
| CSRF tokens | Ephemeral, per-session | 30 min |
| Meta Ads cache | Avoid hitting API rate limits | 15 min |
| Email cooldown | Prevent verification email spam | 60 sec |
| Socket.IO mapping | Track which user is on which Socket server | Until disconnect |
| Typing indicators | Short-lived, no need to persist | 5 sec |

### 1.2 — Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────

enum UserRole {
  ADMIN
  CLIENT
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
}

enum MessageType {
  TEXT
  VOICE
  FILE
}

enum FileScanStatus {
  PENDING
  SCANNING
  CLEAN
  INFECTED
}

enum AuditAction {
  LOGIN
  LOGIN_FAILED
  LOGOUT
  REGISTER
  EMAIL_VERIFIED
  PASSWORD_RESET_REQUESTED
  PASSWORD_RESET_COMPLETED
  PASSWORD_CHANGED
  PROFILE_UPDATED
  META_CONNECTED
  META_DISCONNECTED
  FILE_UPLOADED
  FILE_DOWNLOADED
  FILE_DELETED
  MESSAGE_SENT
  CLIENT_CREATED
  CLIENT_UPDATED
  CLIENT_DELETED
  SETTINGS_CHANGED
}

// ─── USER & AUTH ──────────────────────────────────────

model User {
  id              String       @id @default(cuid())
  email           String       @unique
  passwordHash    String       @map("password_hash")
  fullName        String       @map("full_name")
  avatar          String?
  role            UserRole     @default(CLIENT)
  status          UserStatus   @default(ACTIVE)
  emailVerified   Boolean      @default(false) @map("email_verified")
  lastLoginAt     DateTime?    @map("last_login_at")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  // Relations
  refreshTokens       RefreshToken[]
  emailVerifications   EmailVerification[]
  passwordResets       PasswordReset[]
  metaAccounts         MetaAccount[]
  sentMessages         Message[]         @relation("sender")
  conversationsAsAdmin Conversation[]    @relation("admin")
  conversationsAsClient Conversation[]   @relation("client")
  uploadedFiles        File[]
  auditLogs            AuditLog[]

  @@map("users")
}

model RefreshToken {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  tokenHash   String   @map("token_hash")
  familyId    String   @map("family_id")
  isRevoked   Boolean  @default(false) @map("is_revoked")
  ipAddress   String?  @map("ip_address")
  userAgent   String?  @map("user_agent")
  expiresAt   DateTime @map("expires_at")
  createdAt   DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@index([familyId])
  @@map("refresh_tokens")
}

model EmailVerification {
  id        String    @id @default(cuid())
  userId    String    @map("user_id")
  tokenHash String    @map("token_hash")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([tokenHash])
  @@map("email_verifications")
}

model PasswordReset {
  id        String    @id @default(cuid())
  userId    String    @map("user_id")
  tokenHash String    @map("token_hash")
  ipAddress String?   @map("ip_address")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([tokenHash])
  @@map("password_resets")
}

// ─── META ADS ─────────────────────────────────────────

model MetaAccount {
  id                   String   @id @default(cuid())
  userId               String   @map("user_id")
  metaUserId           String   @map("meta_user_id")
  accessTokenEncrypted String   @map("access_token_encrypted")
  tokenExpiresAt       DateTime @map("token_expires_at")
  adAccountIds         String[] @map("ad_account_ids")
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  adSpendCache AdSpendCache[]

  @@index([userId])
  @@map("meta_accounts")
}

model AdSpendCache {
  id            String   @id @default(cuid())
  metaAccountId String   @map("meta_account_id")
  campaignId    String   @map("campaign_id")
  campaignName  String   @map("campaign_name")
  date          DateTime @db.Date
  spend         Decimal  @db.Decimal(12, 4)
  impressions   Int      @default(0)
  clicks        Int      @default(0)
  conversions   Int      @default(0)
  ctr           Decimal? @db.Decimal(8, 4)
  cpc           Decimal? @db.Decimal(12, 4)
  fetchedAt     DateTime @map("fetched_at")

  metaAccount MetaAccount @relation(fields: [metaAccountId], references: [id], onDelete: Cascade)

  @@unique([metaAccountId, campaignId, date])
  @@index([metaAccountId, date])
  @@map("ad_spend_cache")
}

// ─── MESSAGING ────────────────────────────────────────

model Conversation {
  id            String    @id @default(cuid())
  adminId       String    @map("admin_id")
  clientId      String    @map("client_id")
  lastMessageAt DateTime? @map("last_message_at")
  createdAt     DateTime  @default(now()) @map("created_at")

  admin    User      @relation("admin", fields: [adminId], references: [id])
  client   User      @relation("client", fields: [clientId], references: [id])
  messages Message[]
  files    File[]

  @@unique([adminId, clientId])
  @@index([adminId])
  @@index([clientId])
  @@map("conversations")
}

model Message {
  id               String      @id @default(cuid())
  conversationId   String      @map("conversation_id")
  senderId         String      @map("sender_id")
  contentEncrypted String?     @map("content_encrypted")
  type             MessageType @default(TEXT)
  fileId           String?     @map("file_id")
  readAt           DateTime?   @map("read_at")
  createdAt        DateTime    @default(now()) @map("created_at")

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender       User         @relation("sender", fields: [senderId], references: [id])
  file         File?        @relation(fields: [fileId], references: [id])

  @@index([conversationId, createdAt])
  @@index([senderId])
  @@map("messages")
}

// ─── FILE STORAGE ─────────────────────────────────────

model File {
  id             String         @id @default(cuid())
  uploaderId     String         @map("uploader_id")
  conversationId String?        @map("conversation_id")
  filename       String
  originalName   String         @map("original_name")
  mimeType       String         @map("mime_type")
  size           Int
  s3Key          String         @map("s3_key")
  s3Bucket       String         @map("s3_bucket")
  scanStatus     FileScanStatus @default(PENDING) @map("scan_status")
  thumbnailKey   String?        @map("thumbnail_key")
  createdAt      DateTime       @default(now()) @map("created_at")

  uploader     User          @relation(fields: [uploaderId], references: [id])
  conversation Conversation? @relation(fields: [conversationId], references: [id])
  messages     Message[]

  @@index([uploaderId])
  @@index([conversationId])
  @@index([scanStatus])
  @@map("files")
}

// ─── AUDIT & SECURITY ────────────────────────────────

model AuditLog {
  id         String      @id @default(cuid())
  userId     String?     @map("user_id")
  action     AuditAction
  resource   String?
  resourceId String?     @map("resource_id")
  ipAddress  String?     @map("ip_address")
  userAgent  String?     @map("user_agent")
  metadata   Json?
  createdAt  DateTime    @default(now()) @map("created_at")

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt])
  @@index([action, createdAt])
  @@map("audit_logs")
}

model RateLimitViolation {
  id        String   @id @default(cuid())
  ipAddress String   @map("ip_address")
  userId    String?  @map("user_id")
  endpoint  String
  createdAt DateTime @default(now()) @map("created_at")

  @@index([ipAddress, createdAt])
  @@map("rate_limit_violations")
}
```

---

## Phase 2: Authentication & Security System

### 2.1 — Auth.js v5 (NextAuth) Configuration

- **Provider:** Credentials (email + password)
- **Adapter:** Prisma (PostgreSQL)
- **Strategy:** JWT (edge-compatible via `jose` library)
- **Access token expiry:** 15 minutes (more secure than the 1-hour in original doc)
- **Refresh token expiry:** 7 days with **rotation** (each use invalidates old token, issues new one)
- **Refresh token family tracking:** If a revoked token is reused, ALL tokens in that family are revoked (detects token theft)

### 2.2 — Registration Flow

```
Client submits { fullName, email, password }
    │
    ▼
[1] Validate with Zod schema
    - Email: valid format, lowercase, trimmed
    - Password: min 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    - Full name: 2-100 chars, no script tags
    │
    ▼
[2] Check email uniqueness
    - Timing-safe comparison (constant time — prevents enumeration via timing)
    │
    ▼
[3] Hash password
    - bcryptjs with cost factor 12 (not 10 — stronger)
    │
    ▼
[4] Create user record
    - role: CLIENT, emailVerified: false, status: ACTIVE
    │
    ▼
[5] Generate verification token
    - crypto.randomBytes(32) → hex string
    - Store HASHED token in email_verifications table (never raw)
    - Token valid for 24 hours, single use
    │
    ▼
[6] Send verification email
    - Nodemailer with SMTP transport
    - HTML email template with verification link
    │
    ▼
[7] Return generic success
    - Same response whether email existed or not
    - "If this email is not already registered, you'll receive a verification link"
    │
    ▼
[8] Audit log
    - Action: REGISTER, IP, user agent, timestamp
```

### 2.3 — Login Flow

```
Client submits { email, password }
    │
    ▼
[1] Validate input with Zod
    │
    ▼
[2] Rate limit check (Redis)
    - Max 5 attempts per email per 15 min
    - Max 20 attempts per IP per 15 min
    - If exceeded: return 429 with retry-after header
    │
    ▼
[3] Fetch user by email
    - If not found: still run bcrypt compare against dummy hash (prevent timing attack)
    │
    ▼
[4] Compare password (timing-safe)
    - bcrypt.compare(password, user.passwordHash)
    │
    ▼
[5] Check email_verified
    - If false: return AUTH_002 error
    │
    ▼
[6] Check account status
    - SUSPENDED → AUTH_003 error
    - BANNED → AUTH_003 error
    │
    ▼
[7] Generate token pair
    - Access token: { userId, role, type: 'access' } — 15 min expiry
    - Refresh token: { userId, familyId, type: 'refresh' } — 7 day expiry
    │
    ▼
[8] Store refresh token
    - Hash token, store in refresh_tokens table with familyId
    │
    ▼
[9] Set cookies
    - Refresh token → HttpOnly, Secure, SameSite=Strict, Path=/api/v1/auth
    - CSRF token → SameSite=Strict (readable by JS for double-submit)
    │
    ▼
[10] Return response
    - Access token in response body (stored in memory, NOT localStorage)
    - User profile data
    │
    ▼
[11] Audit log
    - Action: LOGIN (success) or LOGIN_FAILED (failure)
    - IP address, user agent, timestamp
```

### 2.4 — Password Reset Flow

```
[Request Phase]
Client submits { email }
    │
    ▼
[1] Always return success (prevent enumeration)
    - "If an account exists with this email, you'll receive a reset link"
    │
    ▼
[2] If user exists:
    - Generate reset token (crypto.randomBytes(32))
    - Hash and store in password_resets table
    - Token valid for 1 hour, single use
    - Rate limit: max 3 reset requests per email per hour
    │
    ▼
[3] Send reset email with link

[Reset Phase]
Client submits { token, newPassword }
    │
    ▼
[1] Validate new password strength
    │
    ▼
[2] Find reset record by hashed token
    - Check not expired, not already used
    │
    ▼
[3] Hash new password, update user record
    │
    ▼
[4] Mark reset token as used
    │
    ▼
[5] Revoke ALL refresh tokens for this user
    - Forces re-login on all devices
    │
    ▼
[6] Send confirmation email
    │
    ▼
[7] Audit log: PASSWORD_RESET_COMPLETED
```

### 2.5 — Security Middleware Stack

The `middleware.ts` file (Next.js Edge Middleware) runs on every request:

```
Request
  │
  ▼
[1] Request ID Generation
  │  Attach unique X-Request-ID header for tracing
  ▼
[2] Security Headers
  │  CSP, X-Content-Type-Options, X-Frame-Options, HSTS, etc.
  ▼
[3] Rate Limiting (Redis)
  │  Sliding window per IP + endpoint
  │  Tiered limits:
  │    Auth endpoints:     5 req/min
  │    API reads:        100 req/min
  │    API writes:        30 req/min
  │    File uploads:      10 req/min
  ▼
[4] CSRF Verification (for mutations)
  │  Double-submit cookie pattern
  │  Verify X-CSRF-Token header matches cookie value
  ▼
[5] JWT Verification (for protected routes)
  │  Verify access token from Authorization header
  │  Extract userId and role
  ▼
[6] RBAC Check
  │  Compare user role against route requirements
  │  Admin routes → must be ADMIN
  │  Client routes → must be authenticated
  ▼
[7] Input Sanitization
  │  Strip HTML tags from all string inputs
  │  Prevent XSS via server-side sanitization
  ▼
[8] Request Logging
     Structured JSON log (no sensitive data)
     { requestId, method, path, userId, ip, duration }
```

### 2.6 — Security Headers Configuration

Applied via `next.config.ts` headers:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.amazonaws.com;
  connect-src 'self' https://graph.facebook.com wss://{socket-server};
  media-src 'self' https://*.amazonaws.com;
  frame-ancestors 'none';

X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0  (modern CSP replaces this)
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(self), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### 2.7 — Access Control Matrix

| Endpoint | Method | ADMIN | CLIENT | Public |
|----------|--------|-------|--------|--------|
| `/api/v1/auth/register` | POST | — | — | ✅ |
| `/api/v1/auth/login` | POST | — | — | ✅ |
| `/api/v1/auth/verify-email` | POST | — | — | ✅ |
| `/api/v1/auth/forgot-password` | POST | — | — | ✅ |
| `/api/v1/auth/reset-password` | POST | — | — | ✅ |
| `/api/v1/auth/refresh` | POST | ✅ | ✅ | — |
| `/api/v1/auth/logout` | POST | ✅ | ✅ | — |
| `/api/v1/users/me` | GET/PUT | ✅ | ✅ (own) | — |
| `/api/v1/ads/overview` | GET | ✅ (all) | ✅ (own) | — |
| `/api/v1/ads/campaigns` | GET | ✅ (all) | ✅ (own) | — |
| `/api/v1/ads/spending` | GET | ✅ (all) | ✅ (own) | — |
| `/api/v1/ads/export` | GET | ✅ (all) | ✅ (own) | — |
| `/api/v1/messages` | GET/POST | ✅ (all) | ✅ (own) | — |
| `/api/v1/files/presign` | POST | ✅ | ✅ | — |
| `/api/v1/files/confirm` | POST | ✅ | ✅ | — |
| `/api/v1/files/{id}/download` | GET | ✅ (all) | ✅ (own) | — |
| `/api/v1/admin/clients` | GET/POST | ✅ | — | — |
| `/api/v1/admin/clients/{id}` | GET/PUT/DELETE | ✅ | — | — |
| `/api/v1/admin/audit-logs` | GET | ✅ | — | — |
| `/api/v1/meta/connect` | POST | ✅ | — | — |
| `/api/v1/meta/disconnect` | POST | ✅ | — | — |

---

## Phase 3: Meta Ads Integration

### 3.1 — OAuth 2.0 Flow

```
[1] Admin clicks "Connect Meta Ads" for a client
    │
    ▼
[2] Server generates state parameter (CSRF protection)
    - Store state in Redis with 10-min TTL
    │
    ▼
[3] Redirect to Meta OAuth
    - URL: https://www.facebook.com/v21.0/dialog/oauth
    - Scopes: ads_read, ads_management, read_insights
    │
    ▼
[4] User authorizes → Meta redirects to callback
    │
    ▼
[5] Server validates state parameter against Redis
    │
    ▼
[6] Exchange auth code for access token
    - POST https://graph.facebook.com/v21.0/oauth/access_token
    │
    ▼
[7] Exchange for long-lived token (60-day expiry)
    │
    ▼
[8] Encrypt access token with AES-256-GCM
    - Encryption key from ENCRYPTION_KEY env var (separate from DB)
    │
    ▼
[9] Store in meta_accounts table
    │
    ▼
[10] Fetch ad account IDs and store
    │
    ▼
[11] Audit log: META_CONNECTED
```

### 3.2 — Data Fetching & Caching Strategy

```
Dashboard request for ad spend data
    │
    ▼
[Layer 1] Redis cache (TTL: 15 min)
    - Key: meta_ads:{account_id}:{date_hash}
    - Hit → return immediately
    - Miss → continue
    │
    ▼
[Layer 2] PostgreSQL cache (ad_spend_cache table)
    - Check if data for requested date range exists
    - If fetched_at < 1 hour ago → return from DB
    - If stale → continue
    │
    ▼
[Layer 3] Meta Marketing API
    - Decrypt OAuth token from meta_accounts
    - Fetch campaign insights with retry + exponential backoff
    - Rate limit: respect Meta's API limits
    - Store response in ad_spend_cache (PostgreSQL)
    - Cache in Redis (15 min)
    - Return to client
```

**Background refresh (Vercel Cron):**
- Every 30 minutes: refresh data for all active meta_accounts
- Token expiry check: refresh long-lived tokens 7 days before expiry

### 3.3 — Dashboard Data Endpoints

| Endpoint | Response |
|----------|----------|
| `GET /api/v1/ads/overview` | `{ totalSpend, activeCampaigns, totalImpressions, totalClicks, avgCTR, dateRange }` |
| `GET /api/v1/ads/campaigns` | `[{ campaignId, name, status, spend, impressions, clicks, ctr, cpc }]` |
| `GET /api/v1/ads/spending?start=&end=&granularity=daily|weekly|monthly` | `[{ date, spend, impressions, clicks }]` |
| `GET /api/v1/ads/export?format=pdf|csv&start=&end=` | Binary file download |

---

## Phase 4: Real-time Messaging System

### 4.1 — Socket.IO Microservice Architecture

```
┌────────────────────────────────────────┐
│         Socket.IO Server               │
│         (Railway/Render)               │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ Connection Middleware             │  │
│  │  1. JWT verification (jose)      │  │
│  │  2. Rate limiting (Redis)        │  │
│  │  3. User mapping (Redis)         │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ Namespaces                        │  │
│  │  /chat          → messaging       │  │
│  │  /notifications → system notifs   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ Redis Adapter                     │  │
│  │  @socket.io/redis-adapter         │  │
│  │  (horizontal scaling support)     │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### 4.2 — Socket Event Definitions

**Client → Server:**

| Event | Payload | Description |
|-------|---------|-------------|
| `message:send` | `{ conversationId, content, type }` | Send a text message |
| `message:read` | `{ conversationId, messageId }` | Mark message as read |
| `typing:start` | `{ conversationId }` | User started typing |
| `typing:stop` | `{ conversationId }` | User stopped typing |

**Server → Client:**

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `{ message }` | New message received |
| `message:read` | `{ conversationId, messageId, readAt }` | Read receipt |
| `typing:update` | `{ conversationId, userId, isTyping }` | Typing indicator |
| `notification:new` | `{ type, title, body, data }` | System notification |
| `user:online` | `{ userId }` | User came online |
| `user:offline` | `{ userId }` | User went offline |

### 4.3 — Message Security

- All socket events validated with Zod schemas
- Rate limit: max 30 messages per minute per user
- Message content encrypted with AES-256-GCM before database storage
- Encryption key derived from ENCRYPTION_KEY env var
- Messages decrypted only when fetched by authorized users
- RBAC enforced: clients can only message in their own conversations

### 4.4 — Voice Messaging

```
[1] User clicks record button
    │
    ▼
[2] Browser requests microphone permission (MediaRecorder API)
    │
    ▼
[3] Record audio (max 5 minutes)
    - Format: WebM/Opus (browser native) or MP3 (via lamejs)
    - Show waveform visualization during recording
    │
    ▼
[4] User clicks send
    │
    ▼
[5] Request presigned upload URL from Next.js API
    - Validate: audio/* MIME type, max 10MB
    │
    ▼
[6] Upload directly to S3 via presigned PUT URL
    - Show upload progress
    │
    ▼
[7] Confirm upload via Next.js API
    - Creates File record (scan_status: PENDING)
    - Creates Message record (type: VOICE, fileId)
    │
    ▼
[8] Socket notification sent to recipient
    │
    ▼
[9] Recipient fetches audio via presigned GET URL
    - Audio player with play/pause, progress bar, duration
```

### 4.5 — Notification System

| Trigger | In-App (Socket) | Email |
|---------|-----------------|-------|
| New text message | Immediate | If offline >5 min |
| New voice message | Immediate | If offline >5 min |
| New file shared | Immediate | If offline >5 min |
| Meta Ads data updated | — | Weekly digest |
| Account created (by admin) | — | Immediate |
| Password reset requested | — | Immediate |

Email notifications are **debounced**: max 1 notification email per user per 5 minutes.

---

## Phase 5: File Sharing System

### 5.1 — Supported File Types & Limits

| Category | Extensions | Max Size |
|----------|-----------|----------|
| Documents | PDF, DOC, DOCX | 50 MB |
| Images | JPG, JPEG, PNG, GIF, WEBP | 50 MB |
| Audio | MP3, WAV, OGG (voice messages) | 10 MB |
| Spreadsheets | XLS, XLSX | 50 MB |
| Presentations | PPT, PPTX | 50 MB |

**Blocked:** EXE, BAT, SH, JS, PHP, PY, RB, CMD, COM, SCR, MSI, DLL, SYS

### 5.2 — Upload Flow (Presigned URLs)

```
[1] Client → POST /api/v1/files/presign
    Body: { filename, mimeType, size, conversationId? }
    │
    ▼
[2] Server validates:
    - File type in allowlist (by MIME + extension)
    - File size ≤ max for type
    - User has access to conversationId (if provided)
    │
    ▼
[3] Server generates:
    - Unique S3 key: files/{userId}/{year}/{month}/{nanoid}.{ext}
    - Presigned PUT URL (5-min expiry)
    - File record in DB (scan_status: PENDING)
    │
    ▼
[4] Return { uploadUrl, fileId, key }
    │
    ▼
[5] Client uploads directly to S3
    - XHR with progress tracking
    - Show upload progress bar
    │
    ▼
[6] Client → POST /api/v1/files/confirm
    Body: { fileId }
    │
    ▼
[7] Server verifies:
    - File exists on S3 (HeadObject)
    - Content-Type matches declared MIME type
    - File size matches (within 10% tolerance)
    │
    ▼
[8] Trigger virus scan
    - Option A: AWS Lambda + ClamAV
    - Option B: VirusTotal API
    - Update scan_status: SCANNING → CLEAN | INFECTED
    │
    ▼
[9] If image: generate thumbnail via Sharp
    - Store thumbnail at thumbs/{s3Key}
    │
    ▼
[10] Audit log: FILE_UPLOADED
    │
    ▼
[11] Notify recipient via Socket.IO (if in conversation)
```

### 5.3 — Download Flow

```
[1] Client → GET /api/v1/files/{id}/download
    │
    ▼
[2] Server checks:
    - User owns file OR is admin OR file is in user's conversation
    - scan_status is CLEAN (block PENDING/INFECTED downloads)
    │
    ▼
[3] Generate presigned GET URL (15-min expiry)
    - Content-Disposition: attachment; filename="original_name"
    │
    ▼
[4] Return { downloadUrl, filename, size, mimeType }
    │
    ▼
[5] Audit log: FILE_DOWNLOADED
```

### 5.4 — File Preview

| Type | Preview Method |
|------|---------------|
| Images (JPG, PNG, GIF, WEBP) | `<img>` tag with presigned URL + thumbnail |
| PDF | `<iframe>` or `react-pdf` library with presigned URL |
| Documents (DOC, DOCX, PPT, PPTX, XLS, XLSX) | Download only (no inline preview) |
| Audio (MP3, WAV, OGG) | HTML5 `<audio>` player with presigned URL |

---

## Phase 6: Frontend Development

### 6.1 — UI Foundation

**Component library:** shadcn/ui (Radix UI primitives + Tailwind styling)

Install components:
- Button, Input, Label, Textarea
- Dialog, Sheet, Dropdown Menu, Popover
- Tabs, Accordion, Tooltip
- Avatar, Badge, Card, Skeleton
- Toast (via Sonner), Alert
- Table, Pagination
- Select, Checkbox, Radio Group
- Progress, Separator
- Command (for search)

**State management:** Zustand

| Store | Purpose | Key State |
|-------|---------|-----------|
| `useAuthStore` | Auth state | `user`, `accessToken`, `isAuthenticated`, `login()`, `logout()`, `refresh()` |
| `useMessageStore` | Chat state | `conversations`, `activeConversation`, `messages`, `unreadCount` |
| `useNotificationStore` | Notifications | `notifications`, `unreadCount`, `markAsRead()` |
| `useFileStore` | File management | `files`, `uploadProgress`, `uploadFile()`, `deleteFile()` |

**Form handling:** react-hook-form + Zod resolvers

All forms use the same Zod schemas as the backend API validation — shared in `lib/validators/`.

### 6.2 — Auth Pages (Route Group: `(auth)`)

**Layout:** Centered card design, no Header/Footer, brand logo only

**Pages:**

| Page | Features |
|------|----------|
| `/login` | Email + password, "Remember me", show/hide password toggle, field-level validation errors, server error toasts, "Forgot password?" link, "Register" link |
| `/register` | Name + email + password + confirm password + terms checkbox, password strength meter (visual indicator), field-level validation, success → redirect to verify email prompt |
| `/forgot-password` | Email input, success state UI ("Check your email"), rate limit notice |
| `/reset-password?token=` | New password + confirm, token validation, success → redirect to login |
| `/verify-email?token=` | Auto-verify on load, success/error states, resend button with cooldown |

### 6.3 — Client Dashboard (Route Group: `(dashboard)`)

**Layout:** Sidebar (collapsible) + TopBar (user avatar, notifications bell, search)

**Dashboard page components:**

| Component | Description |
|-----------|-------------|
| `StatsCard` | 4 cards: Total Spend, Active Campaigns, Avg. CTR, Messages |
| `SpendingChart` | Line chart (Recharts) with date range selector |
| `CampaignTable` | Sortable table of campaigns with spend, impressions, clicks, CTR |
| `RecentMessages` | Last 5 messages with sender avatar and preview text |
| `RecentFiles` | Last 5 files with type icon and size |
| `QuickActions` | Buttons: Send Message, Upload File, View Full Report |

### 6.4 — Admin Dashboard

**Additional to client dashboard:**

| Component | Description |
|-----------|-------------|
| Client list | Searchable, filterable table of all clients |
| Client detail | Profile, ad data, conversation, files for a specific client |
| Create client | Form to create new client account |
| Activity log | Paginated audit log from `audit_logs` table |
| System-wide stats | Aggregated spending across all clients |

### 6.5 — Messaging UI

| Component | Description |
|-----------|-------------|
| `ConversationList` | Sidebar list sorted by `lastMessageAt`, shows avatar, name, last message preview, unread badge |
| `ChatView` | Main chat area with message bubbles (right = sent, left = received), timestamps, date separators |
| `MessageBubble` | Text bubble, voice player, or file attachment display depending on `type` |
| `MessageInput` | Text input with send button, emoji picker (optional), attachment button, voice record button |
| `VoiceRecorder` | Circular record button → recording timer → waveform → send/cancel actions |
| `TypingIndicator` | Animated dots below message area ("Agency is typing...") |
| `FileAttachment` | File preview card within message (type icon, filename, size, download button) |

**Features:**
- Infinite scroll (cursor-based pagination, load older messages on scroll up)
- Real-time via Socket.IO (new messages, read receipts, typing indicators)
- Message search (search bar at top → highlight matches)
- Auto-scroll to newest message (with "New messages" button if scrolled up)

### 6.6 — File Manager UI

| Component | Description |
|-----------|-------------|
| `FileGrid` | Card grid view with thumbnail/icon, filename, date |
| `FileList` | Table view with sortable columns (name, type, size, date, uploader) |
| `FileUploadZone` | Drag-and-drop + click-to-browse, shows upload progress per file |
| `FilePreview` | Modal: image zoom, PDF viewer, audio player |
| `FileDetails` | Side panel: filename, size, uploader, date, scan status, download button |
| `FileFilter` | Filter by type (All, Documents, Images, Audio), date range, conversation |

### 6.7 — Settings Pages

| Page | Features |
|------|----------|
| Profile | Edit name, email (with re-verification), upload avatar |
| Security | Change password, view active sessions (IP, device, last active), revoke sessions |
| Notifications | Toggle email notifications (new message, file shared, weekly digest) |
| Meta Ads (Admin) | Connect/disconnect Meta account, view connected ad accounts |

---

## Phase 7: Error Handling & Logging

### 7.1 — Frontend Error Handling

**Global level:**
- `app/error.tsx` — React error boundary for rendering errors
- `app/not-found.tsx` — Custom 404 page
- `app/loading.tsx` — Root loading skeleton

**API layer:**
- Centralized fetch wrapper (`lib/api/client.ts`) with error interceptor:

```
Response received
    │
    ├─ 200-299 → Return data
    │
    ├─ 401 (AUTH_004: Token expired)
    │   → Attempt token refresh via /api/v1/auth/refresh
    │   → Retry original request with new token
    │   → If refresh fails → logout, redirect to /login
    │
    ├─ 403 (PERM_001: Forbidden)
    │   → Toast: "You don't have permission to perform this action"
    │
    ├─ 422 (VAL_001: Validation error)
    │   → Return field-level errors to react-hook-form
    │   → Highlight invalid fields with error messages
    │
    ├─ 429 (RATE_001: Rate limited)
    │   → Toast: "Too many attempts. Try again in {retryAfter} seconds"
    │   → Disable submit button for retryAfter duration
    │
    ├─ 500 (SRV_001: Server error)
    │   → Toast: "Something went wrong. Error code: {code}. Request ID: {requestId}"
    │   → Log to Sentry with full context
    │
    └─ Network error
        → Toast: "Connection lost. Please check your internet."
        → Retry with exponential backoff (3 attempts)
```

**Component level:**
- Loading skeletons for every async data fetch
- Empty states for no data (no messages, no files, no campaigns)
- Optimistic updates for messages (show immediately, rollback on failure)

### 7.2 — Backend Error Handling

**Error class hierarchy:**

```
AppError (base)
├── AuthError
│   ├── InvalidCredentialsError     (AUTH_001, 401)
│   ├── EmailNotVerifiedError       (AUTH_002, 403)
│   ├── AccountSuspendedError       (AUTH_003, 403)
│   ├── TokenExpiredError           (AUTH_004, 401)
│   └── TokenInvalidError           (AUTH_005, 401)
├── ValidationError                  (VAL_001, 422)
├── NotFoundError                    (NOT_001, 404)
├── ForbiddenError                   (PERM_001, 403)
├── RateLimitError                   (RATE_001, 429)
├── FileError
│   ├── FileTooLargeError           (FILE_001, 413)
│   ├── InvalidFileTypeError        (FILE_002, 422)
│   └── FileInfectedError          (FILE_003, 403)
├── MetaApiError                     (META_001, 502)
└── InternalError                    (SRV_001, 500)
```

**Error response format:**

```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Invalid email or password",
    "requestId": "req_abc123xyz",
    "details": null
  }
}
```

For validation errors (`VAL_001`):
```json
{
  "success": false,
  "error": {
    "code": "VAL_001",
    "message": "Validation failed",
    "requestId": "req_abc123xyz",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "password": "Must be at least 12 characters"
      }
    }
  }
}
```

**Critical rule:** In production, NEVER include:
- Stack traces
- SQL/Prisma error messages
- File system paths
- Server configuration details
- Internal function names
- Database schema information

### 7.3 — Structured Logging (Pino)

**Log format:**
```json
{
  "level": "info",
  "time": "2026-02-17T10:30:00.000Z",
  "requestId": "req_abc123xyz",
  "method": "POST",
  "path": "/api/v1/auth/login",
  "userId": "user_xyz",
  "ip": "203.0.113.50",
  "statusCode": 200,
  "duration": 145,
  "message": "Login successful"
}
```

**Redacted fields** (never logged):
- `password`, `passwordHash`
- `accessToken`, `refreshToken`
- `authorization` header
- `cookie` header
- `encryptionKey`
- Any field containing `secret`, `token`, `key`, `password`

**Log levels:**
| Level | When | Example |
|-------|------|---------|
| `error` | 500 server errors, unhandled exceptions | Database connection failure |
| `warn` | 4xx client errors, suspicious activity | Rate limit hit, invalid token |
| `info` | Successful operations | User login, file upload, message sent |
| `debug` | Development only | SQL queries, request bodies, function calls |

### 7.4 — Monitoring

| Tool | Purpose | Coverage |
|------|---------|----------|
| Sentry | Error tracking | Frontend JS errors + backend API errors |
| Vercel Analytics | Performance | Core Web Vitals, page load times |
| Vercel Logs | Server logs | API route logs, Edge middleware logs |
| Railway Logs | Socket.IO logs | Connection events, message events |
| Health endpoint | Uptime monitoring | `GET /api/health` → checks DB, Redis, S3 |

---

## Phase 8: Testing

### 8.1 — Unit Tests (Vitest)

| Target | What to Test |
|--------|-------------|
| `lib/validators/*.ts` | All Zod schemas — valid/invalid inputs |
| `lib/auth/password.ts` | Hash, compare, strength validation |
| `lib/auth/tokens.ts` | JWT generation, verification, expiry |
| `lib/security/encryption.ts` | AES-256-GCM encrypt/decrypt round-trip |
| `lib/security/sanitize.ts` | XSS prevention, HTML stripping |
| `lib/errors/*.ts` | Error classes, error code mapping |
| `lib/redis/rate-limit.ts` | Sliding window algorithm |

**Target: 80%+ code coverage**

### 8.2 — Integration Tests (Vitest + Next.js test helpers)

| Flow | Test Scenarios |
|------|---------------|
| Registration | Valid registration, duplicate email, weak password, missing fields |
| Login | Valid credentials, wrong password, unverified email, suspended account, rate limiting |
| Token refresh | Valid refresh, expired refresh, revoked refresh, token family theft detection |
| Password reset | Request reset, use token, expired token, reused token |
| File upload | Valid upload, oversized file, invalid type, unauthorized access |
| Meta Ads | OAuth flow, data fetching, caching behavior |
| RBAC | Admin access to admin routes, client denied from admin routes, client access to own data only |

### 8.3 — End-to-End Tests (Playwright)

| Journey | Steps |
|---------|-------|
| Client onboarding | Register → verify email → login → view dashboard |
| Messaging | Login → open conversation → send text → receive reply → send voice message |
| File sharing | Login → open file manager → upload file → download file → preview image |
| Admin workflow | Login as admin → create client → view client dashboard → send message |
| Password recovery | Forgot password → receive email → reset → login with new password |
| Auth security | Try expired token → auto refresh → continue session |

### 8.4 — Security Tests

| Test | Method |
|------|--------|
| SQL injection | Send `'; DROP TABLE users; --` in all input fields |
| XSS | Send `<script>alert('xss')</script>` in all text fields |
| CSRF | Make mutation request without CSRF token |
| Auth bypass | Access protected routes with no token, expired token, tampered token |
| Rate limiting | Send requests at twice the limit, verify 429 response |
| File upload bypass | Upload `.exe` renamed as `.pdf`, verify rejection |
| IDOR | Client A tries to access Client B's data |
| Token theft | Reuse a revoked refresh token, verify family revocation |

---

## Phase 9: Deployment & DevOps

### 9.1 — Deployment Targets

| Service | Platform | Plan | Cost (est.) |
|---------|----------|------|-------------|
| Next.js app | Vercel | Pro ($20/mo) | $20/mo |
| Socket.IO server | Railway | Starter ($5/mo) | $5-15/mo |
| PostgreSQL | Railway (or Neon) | Starter | $5-10/mo |
| Redis | Railway (or Upstash) | Free/Starter | $0-10/mo |
| File storage | AWS S3 | Pay-as-you-go | $1-5/mo |
| Email | Resend (or AWS SES) | Free tier → Pro | $0-20/mo |
| Monitoring | Sentry | Free tier | $0/mo |
| Domain + SSL | Vercel (auto) | Included | $0/mo |
| **Total** | | | **~$31-80/mo** |

### 9.2 — CI/CD Pipeline (GitHub Actions)

```yaml
# On Pull Request
pull_request:
  - Lint (ESLint)
  - Type check (tsc --noEmit)
  - Unit tests (vitest)
  - Integration tests (vitest)
  - Build check (next build)
  - Security audit (npm audit)

# On merge to main
push (main):
  - All PR checks +
  - E2E tests (Playwright against staging)
  - Deploy Next.js to Vercel (auto via Vercel GitHub integration)
  - Build & deploy Socket.IO server Docker image to Railway
  - Run Prisma migrations on production DB
  - Notify Sentry of new release
  - Slack/Discord notification
```

### 9.3 — Environment Management

| Environment | URL | Database | Purpose |
|-------------|-----|----------|---------|
| Development | `localhost:3000` | Local PostgreSQL + Redis | Local development |
| Staging | `staging.motionbooster.com` | Staging DB (Railway) | Pre-production testing |
| Production | `app.motionbooster.com` | Production DB (Railway) | Live users |

### 9.4 — Backup & Recovery

| What | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| PostgreSQL | Daily | 30 days | Railway automated backups + pg_dump to S3 |
| Redis | N/A (ephemeral data) | — | — |
| S3 files | Continuous | Indefinite | S3 versioning + cross-region replication |
| Prisma migrations | Every deploy | Git history | Committed to repository |

---

## Implementation Order (Priority Sequence)

| Step | Phase | What | Depends On | Est. Days |
|------|-------|------|------------|-----------|
| 1 | Phase 0 | Cleanup + restructure + install deps | — | 1 |
| 2 | Phase 1 | Prisma schema + DB setup + Redis | — | 1-2 |
| 3 | Phase 2.1-2.4 | Auth system (register, login, verify, reset) | Step 2 | 3-4 |
| 4 | Phase 2.5-2.7 | Security middleware + error codes | Step 3 | 2 |
| 5 | Phase 7.2 | Backend error handling framework | Step 4 | 1 |
| 6 | Phase 6.1-6.2 | UI foundation (shadcn/ui) + auth pages | Step 3 | 2-3 |
| 7 | Phase 7.1 | Frontend error handling | Step 6 | 1 |
| 8 | Phase 6.3-6.4 | Dashboard UI (client + admin) | Step 6 | 3-4 |
| 9 | Phase 3 | Meta Ads integration + dashboard data | Steps 4, 8 | 3-4 |
| 10 | Phase 4 | Socket.IO server + messaging backend | Step 4 | 3-4 |
| 11 | Phase 6.5 | Messaging UI | Step 10 | 2-3 |
| 12 | Phase 5 | File sharing backend | Step 4 | 2-3 |
| 13 | Phase 6.6 | File manager UI | Step 12 | 2 |
| 14 | Phase 6.7 | Settings pages | Step 6 | 1-2 |
| 15 | Phase 7.3-7.4 | Logging + monitoring setup | All above | 1 |
| 16 | Phase 8 | Testing (unit + integration + E2E) | All above | 3-5 |
| 17 | Phase 9 | Deployment + CI/CD pipeline | All above | 2-3 |

**Total: ~30-40 days of active development**

---

## Security Checklist (Cross-cutting)

Every feature must pass ALL of these before being considered complete:

- [ ] **Input validation** — Zod schema on server-side (never trust client)
- [ ] **Rate limiting** — Redis-backed sliding window on all endpoints
- [ ] **RBAC enforced** — Middleware checks role + resource ownership
- [ ] **SQL injection safe** — Prisma parameterized queries (never raw SQL)
- [ ] **XSS safe** — Sanitized output, Content-Security-Policy headers
- [ ] **CSRF protected** — Double-submit cookie on all state-changing requests
- [ ] **Sensitive data encrypted** — AES-256-GCM at rest (OAuth tokens, message content)
- [ ] **Passwords hashed** — bcrypt with cost factor 12
- [ ] **Tokens secure** — JWT with short expiry, refresh rotation, HttpOnly cookies
- [ ] **Audit logged** — Every security-relevant action recorded (who, what, when, where)
- [ ] **Error responses sanitized** — No internal details leaked in production
- [ ] **File uploads validated** — Type + size + content verification + virus scan
- [ ] **HTTPS only** — HSTS header, secure cookies, no mixed content
- [ ] **Dependencies audited** — No known vulnerabilities (npm audit)
- [ ] **Tests written** — Unit + integration at minimum

---

## Error Code Catalog

### Authentication Errors (AUTH_xxx)

| Code | HTTP | Message | When |
|------|------|---------|------|
| `AUTH_001` | 401 | Invalid email or password | Wrong credentials |
| `AUTH_002` | 403 | Email not verified | Login before verification |
| `AUTH_003` | 403 | Account suspended | Suspended/banned account |
| `AUTH_004` | 401 | Token expired | Access token expired |
| `AUTH_005` | 401 | Token invalid | Tampered/malformed token |
| `AUTH_006` | 422 | Password does not meet requirements | Weak password on register/reset |
| `AUTH_007` | 400 | Verification token expired or invalid | Bad email verification token |
| `AUTH_008` | 400 | Reset token expired or invalid | Bad password reset token |

### Validation Errors (VAL_xxx)

| Code | HTTP | Message | When |
|------|------|---------|------|
| `VAL_001` | 422 | Validation failed | Any field validation failure (includes field details) |
| `VAL_002` | 400 | Invalid request format | Malformed JSON, missing Content-Type |

### Permission Errors (PERM_xxx)

| Code | HTTP | Message | When |
|------|------|---------|------|
| `PERM_001` | 403 | Insufficient permissions | Role doesn't match requirement |
| `PERM_002` | 403 | Access denied | Trying to access another user's data (IDOR) |

### Rate Limit Errors (RATE_xxx)

| Code | HTTP | Message | When |
|------|------|---------|------|
| `RATE_001` | 429 | Too many requests | Rate limit exceeded (includes Retry-After header) |

### Resource Errors (NOT_xxx)

| Code | HTTP | Message | When |
|------|------|---------|------|
| `NOT_001` | 404 | Resource not found | Entity doesn't exist |

### File Errors (FILE_xxx)

| Code | HTTP | Message | When |
|------|------|---------|------|
| `FILE_001` | 413 | File too large | Exceeds size limit for type |
| `FILE_002` | 422 | File type not allowed | Blocked extension/MIME type |
| `FILE_003` | 403 | File flagged as infected | Virus scan failed |
| `FILE_004` | 409 | File scan in progress | Download attempted while scanning |

### Meta API Errors (META_xxx)

| Code | HTTP | Message | When |
|------|------|---------|------|
| `META_001` | 502 | Meta API connection failed | OAuth or API call failed |
| `META_002` | 400 | Meta account not connected | Data requested but no Meta account linked |
| `META_003` | 502 | Meta API rate limited | Facebook rate limit hit |

### Server Errors (SRV_xxx)

| Code | HTTP | Message | When |
|------|------|---------|------|
| `SRV_001` | 500 | An unexpected error occurred | Any unhandled server error |
| `SRV_002` | 503 | Service temporarily unavailable | DB/Redis down |

---

## Key Architectural Decisions

### 1. Full Next.js Monorepo (over separate React + Express)

**Rationale:** Simpler deployment, fewer moving parts, unified TypeScript codebase, Server Components for security-sensitive rendering, built-in API routes eliminate the need for a separate Express server. Server Actions provide type-safe mutations with automatic CSRF protection.

**Trade-off:** Socket.IO requires a separate microservice since Vercel doesn't support persistent WebSocket connections.

### 2. PostgreSQL + Redis (over MongoDB)

**Rationale:** Relational integrity for users ↔ messages ↔ files ↔ ad_accounts. ACID transactions for authentication flows. Row-Level Security for defense-in-depth. Strong typing for financial data (ad spend). Built-in full-text search.

**Redis complement:** Handles ephemeral data (rate limits, caching, sessions, typing indicators) that doesn't belong in PostgreSQL. Orders of magnitude faster for these use cases.

### 3. 15-minute Access Tokens (over 1-hour)

**Rationale:** Shorter window of vulnerability if a token is stolen. Refresh token rotation compensates for the UX impact. Industry best practice (OWASP recommends 5-15 minutes for high-security applications).

### 4. 12-character Minimum Password (over 8)

**Rationale:** NIST SP 800-63B (2024) recommends ≥12 characters. Combined with bcrypt cost factor 12, makes brute-force attacks computationally infeasible. Password strength meter provides UX guidance.

### 5. Presigned S3 URLs (over server-proxied uploads)

**Rationale:** Files never flow through the application server — reduces attack surface, eliminates server memory/CPU bottleneck for large files, and enables direct client-to-S3 uploads with progress tracking. Server only handles authorization and metadata.

### 6. Separate Socket.IO Server (over integrated WebSocket)

**Rationale:** Vercel's serverless architecture doesn't support persistent WebSocket connections. A dedicated Socket.IO server on Railway/Render handles long-lived connections, can scale independently, and uses Redis adapter for horizontal scaling.

### 7. AES-256-GCM for At-Rest Encryption

**Rationale:** Authenticated encryption with associated data prevents both unauthorized reading AND tampering. Used for Meta OAuth tokens and message content. Encryption key stored in environment variables, separate from the database.

### 8. Auth.js v5 (over custom JWT implementation)

**Rationale:** Battle-tested library that handles edge cases (CSRF in forms, session rotation, adapter patterns). Integrates natively with Next.js App Router, Prisma, and Edge middleware. Reduces the attack surface of custom authentication code.

---

## Verification Criteria

The project is considered production-ready when ALL of the following are met:

### Technical

- [ ] `npx prisma migrate deploy` — all migrations applied successfully
- [ ] `npm run build` — zero TypeScript errors, zero lint errors
- [ ] `npm run test` — all tests passing, 80%+ code coverage
- [ ] `npm run test:e2e` — all E2E scenarios passing
- [ ] Lighthouse audit — Performance >90, Accessibility >95, SEO >95
- [ ] OWASP ZAP scan — zero critical/high vulnerabilities
- [ ] `npm audit` — zero critical/high dependency vulnerabilities
- [ ] API response time <200ms for 95th percentile
- [ ] Page load time <2 seconds (LCP)

### Functional

- [ ] Full auth flow: register → verify email → login → refresh → logout
- [ ] Password reset flow: request → email received → reset → login
- [ ] Meta Ads: OAuth connect → data fetch → dashboard display → export
- [ ] Messaging: send text → receive in real-time → read receipt → voice message
- [ ] File sharing: upload → virus scan → download → preview
- [ ] Admin CRUD: create client → edit → view data → delete
- [ ] RBAC: client cannot access admin routes, client can only see own data

### Security

- [ ] SQL injection attempts return validation error (not SQL error)
- [ ] XSS scripts are stripped/escaped in all outputs
- [ ] CSRF tokens required for all mutations
- [ ] Expired JWT returns 401, not 500
- [ ] Rate limiting triggers 429 at correct thresholds
- [ ] Tampered JWT returns 401
- [ ] Revoked refresh token triggers family revocation
- [ ] File upload with disguised extension is rejected
- [ ] Error responses contain no internal details in production
- [ ] Audit log captures all security events

---

*Last updated: February 17, 2026*
