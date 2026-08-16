# ☁️ CloudLens — Frontend Page Guide (Phases 0–3)

> **Purpose:** Complete reference for every frontend page, route, layout, component, and configuration file.  
> Use this to manually modify any part of the frontend UI.  
> **Last Updated:** July 17, 2026  
> **Status:** Phases 0–3 complete (Project Scaffolding → Landing Page → GitHub Integration & Repo Listing)

---

## Table of Contents

1. [Project Overview & Tech Stack](#1-project-overview--tech-stack)
2. [File Tree Map](#2-file-tree-map)
3. [Dependencies & How to Install](#3-dependencies--how-to-install)
4. [Configuration Files](#4-configuration-files)
5. [Design System (CSS & Tokens)](#5-design-system-css--tokens)
6. [Route Map & How Routing Works](#6-route-map--how-routing-works)
7. [Page 1 — Landing Page (Public Home)](#7-page-1--landing-page-public-home)
8. [Page 2 — Dashboard Overview](#8-page-2--dashboard-overview)
9. [Page 3 — Repositories Page](#9-page-3--repositories-page)
10. [Page 4 — NextAuth Sign-in (Auto-generated)](#10-page-4--nextauth-sign-in-auto-generated)
11. [Layout Files](#11-layout-files)
12. [Layout Components (Sidebar, Header, PublicNav)](#12-layout-components-sidebar-header-publicnav)
13. [UI Primitive Components](#13-ui-primitive-components)
14. [Composite Components](#14-composite-components)
15. [Server Actions](#15-server-actions)
16. [Middleware & Auth](#16-middleware--auth)
17. [API Routes](#17-api-routes)
18. [Missing Pages (To Be Built in Future Phases)](#18-missing-pages-to-be-built-in-future-phases)
19. [Quick-Reference: Where to Edit for Common Changes](#19-quick-reference-where-to-edit-for-common-changes)

---

## 1. Project Overview & Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.6 |
| Language | TypeScript | ^5 |
| React | React + React DOM | 19.2.4 |
| Styling | Tailwind CSS v4 + PostCSS | ^4 |
| UI Library | shadcn/ui (customized) | ^4.7.0 |
| CSS Utility | `class-variance-authority`, `clsx`, `tailwind-merge` | latest |
| Animation | Framer Motion | ^12.38.0 |
| Icons | Lucide React (+ inline SVGs) | ^1.16.0 |
| Auth | NextAuth.js v5 (beta) + Drizzle Adapter | ^5.0.0-beta.31 |
| Database ORM | Drizzle ORM | ^0.45.2 |
| Database | PostgreSQL (Neon serverless) | — |
| Font | Inter (Google Fonts via `next/font`) | 500, 600, 700 |

---

## 2. File Tree Map

```
cloudlens/
├── .env                          # Environment variables (never commit)
├── .env.example                  # Template for env vars
├── components.json               # shadcn/ui CLI config
├── middleware.ts                  # Auth middleware (protects /dashboard)
├── next.config.ts                # Next.js config (image domains)
├── package.json                  # All dependencies & scripts
├── postcss.config.mjs            # PostCSS → Tailwind plugin
├── tailwind.config.ts            # Tailwind custom theme tokens
├── tsconfig.json                 # TypeScript config + path aliases
│
├── public/                       # Static assets (favicon, images)
│
└── src/
    ├── app/
    │   ├── globals.css           # ★ Master CSS — design tokens, resets, typography utilities
    │   ├── layout.tsx            # ★ Root layout (html, body, font, SessionProvider)
    │   ├── actions.ts            # Server Action: syncRepositories()
    │   ├── favicon.ico
    │   │
    │   ├── (public)/             # ← Route group for public pages
    │   │   ├── layout.tsx        # Public layout (PublicNav + Footer)
    │   │   └── page.tsx          # ★ LANDING PAGE (route: /)
    │   │
    │   ├── (dashboard)/          # ← Route group for authenticated pages
    │   │   ├── layout.tsx        # Dashboard layout (auth check + DashboardShell)
    │   │   ├── DashboardShell.tsx # Client wrapper (Sidebar + Header + content)
    │   │   └── dashboard/
    │   │       ├── page.tsx      # ★ DASHBOARD OVERVIEW (route: /dashboard)
    │   │       └── repositories/
    │   │           └── page.tsx  # ★ REPOSITORIES LIST (route: /dashboard/repositories)
    │   │
    │   └── api/
    │       └── auth/
    │           └── [...nextauth]/
    │               └── route.ts  # NextAuth API handler (GET + POST)
    │
    ├── components/
    │   ├── index.ts              # Barrel export for all composite components
    │   ├── SessionProvider.tsx    # NextAuth SessionProvider wrapper
    │   ├── FadeIn.tsx            # Framer Motion scroll-triggered fade
    │   ├── FeatureCard.tsx       # Landing page feature card
    │   ├── TerminalCodeBlock.tsx  # macOS terminal with syntax highlighting
    │   ├── RepoCard.tsx          # Repository card for dashboard
    │   ├── AlertCard.tsx         # Alert card for notifications
    │   ├── StatusBar.tsx         # Neon-style status dot + label
    │   ├── SkeletonRepoCard.tsx  # Loading skeleton for RepoCard
    │   ├── RepositoryList.tsx    # Full repository list with search/filter/sync
    │   │
    │   ├── layout/
    │   │   ├── index.ts          # Barrel export for layout components
    │   │   ├── Sidebar.tsx       # Dashboard sidebar navigation
    │   │   ├── Header.tsx        # Dashboard top header bar
    │   │   └── PublicNav.tsx     # Landing page top navigation
    │   │
    │   └── ui/
    │       ├── index.ts          # Barrel export for UI primitives
    │       ├── button.tsx        # Button (7 variants, spinner, loading state)
    │       ├── badge.tsx         # Badge (12 variants — providers + statuses)
    │       ├── card.tsx          # Card (8 variants + sub-components)
    │       └── input.tsx         # Input (search icon, sizes, focus ring)
    │
    ├── db/
    │   ├── index.ts              # Drizzle DB client singleton
    │   ├── schema.ts             # All table definitions
    │   └── migrations/           # Drizzle migration files
    │
    ├── lib/
    │   ├── auth.ts               # NextAuth config (GitHub OAuth, JWT, callbacks)
    │   ├── github.ts             # GitHub API service (repos, contents, tree)
    │   └── utils.ts              # cn() utility (clsx + tailwind-merge)
    │
    └── types/
        └── next-auth.d.ts        # TypeScript augmentation for NextAuth Session
```

---

## 3. Dependencies & How to Install

### Installation

```bash
cd cloudlens
npm install
```

### Runtime Dependencies

| Package | What It Does |
|---------|-------------|
| `next` | React framework with App Router, SSR, server components |
| `react`, `react-dom` | React 19 core |
| `next-auth` | Authentication (GitHub OAuth) |
| `@auth/drizzle-adapter` | Connects NextAuth to Drizzle/PostgreSQL |
| `drizzle-orm` | Type-safe SQL ORM |
| `@neondatabase/serverless` | Neon PostgreSQL driver (serverless edge) |
| `postgres` | PostgreSQL driver (Node.js) |
| `framer-motion` | Scroll-triggered animations (FadeIn) |
| `lucide-react` | Icon library (not heavily used — most icons are inline SVG) |
| `class-variance-authority` | CVA — variant-based component styling |
| `clsx` | Conditional className merging |
| `tailwind-merge` | Intelligent Tailwind class deduplication |
| `shadcn` | shadcn/ui CLI for generating base components |
| `tw-animate-css` | Animation utilities for Tailwind |
| `@base-ui/react` | Base UI primitives from MUI (available but lightly used) |

### Dev Dependencies

| Package | What It Does |
|---------|-------------|
| `tailwindcss`, `@tailwindcss/postcss` | Tailwind CSS v4 engine |
| `typescript`, `@types/node`, `@types/react`, `@types/react-dom` | TypeScript + type definitions |
| `eslint`, `eslint-config-next`, `eslint-config-prettier` | Linting |
| `prettier` | Code formatting |
| `drizzle-kit` | DB migration CLI |
| `dotenv` | Environment variable loading |

### NPM Scripts

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## 4. Configuration Files

### `next.config.ts` — Next.js Configuration

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",  // GitHub user avatars
      },
    ],
  },
};

export default nextConfig;
```

**What it does:** Allows `<Image>` to load GitHub avatars. If you need images from other domains, add them here.

---

### `tailwind.config.ts` — Tailwind Theme

Extends Tailwind with CloudLens design tokens. All custom colors reference CSS custom properties defined in `globals.css`.

**Key custom tokens:**
- **Colors:** `canvas`, `surface-1/2/3`, `ink`, `ink-muted`, `ink-subtle`, `hairline`, `accent-blue`, product colors (terraform, vault, consul, etc.), semantic colors (success, warning, error)
- **Spacing:** `hair` (1px), `xxs` (4px), `xs` (8px), `sm` (12px), `md` (16px), `lg` (24px), `xl` (32px), `xxl` (48px), `section` (96px)
- **Border Radius:** `xs` through `pill` (9999px)
- **Font:** `sans` → `var(--ff-sans)` (Inter)

---

### `tsconfig.json` — Path Aliases

```json
"paths": {
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/db/*": ["./src/db/*"],
  "@/styles/*": ["./src/styles/*"]
}
```

**Usage in imports:**
```typescript
import { Button } from "@/components/ui";
import { auth } from "@/lib/auth";
import { db } from "@/db";
```

---

### `.env.example` — Required Environment Variables

```bash
DATABASE_URL=""              # Neon PostgreSQL connection string
NEXTAUTH_SECRET=""           # Generate with: npx auth secret
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID=""          # From GitHub Developer Settings
GITHUB_CLIENT_SECRET=""      # From GitHub Developer Settings
```

---

### `components.json` — shadcn/ui Config

```json
{
  "style": "base-nova",
  "rsc": true,            // React Server Components enabled
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

---

### `postcss.config.mjs`

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

---

## 5. Design System (CSS & Tokens)

**File:** `src/app/globals.css` (349 lines)

This is the **master design system file**. It defines every visual token used across the app.

### Color Palette (Dark Theme)

| Token | Hex | Usage |
|-------|-----|-------|
| `--canvas` | `#000000` | Page background |
| `--surface-1` | `#15181e` | Cards, sidebar bg |
| `--surface-2` | `#1f232b` | Elevated surfaces, inputs |
| `--surface-3` | `#3b3d45` | Highest elevation, active states |
| `--ink` | `#ffffff` | Primary text |
| `--ink-muted` | `#b2b6bd` | Secondary text |
| `--ink-subtle` | `#656a76` | Tertiary/placeholder text |
| `--hairline` | `#3b3d45` | Borders |
| `--hairline-soft` | `#252830` | Subtle separators |
| `--accent-blue` | `#2b89ff` | Primary accent, links, focus rings |
| `--semantic-success` | `#00ca8e` | Success states (green) |
| `--semantic-warning` | `#ffcf25` | Warning states (yellow) |
| `--semantic-error` | `#e62b1e` | Error states (red) |

### Product Identity Colors

| Token | Hex | Product |
|-------|-----|---------|
| `--product-terraform` | `#7b42bc` | Terraform (purple) |
| `--product-terraform-bright` | `#911ced` | Terraform bright |
| `--product-vault` | `#ffcf25` | Vault (yellow) |
| `--product-consul` | `#e62b1e` | Consul (red) |
| `--product-waypoint` | `#14c6cb` | Waypoint (teal) |
| `--product-vagrant` | `#1868f2` | Vagrant (blue) |
| `--product-nomad` | `#00ca8e` | Nomad (green) |
| `--product-boundary` | `#f24c53` | Boundary (coral) |

### Typography Utility Classes

| Class | Size | Weight | Use Case |
|-------|------|--------|----------|
| `.text-display-xl` | 80px | 700 | Hero headline |
| `.text-display-lg` | 56px | 700 | Section headlines |
| `.text-display-md` | 40px | 600 | Sub-section headlines |
| `.text-headline` | 28px | 600 | Card section titles |
| `.text-card-title` | 22px | 600 | Card headings |
| `.text-subhead` | 20px | 600 | Subheadings |
| `.text-body-lg` | 18px | 500 | Hero body text |
| `.text-body` | 16px | 500 | Default body text |
| `.text-body-sm` | 14px | 500 | Smaller body text |
| `.text-caption` | 13px | 500 | Captions, footer links |
| `.text-button` | 14px | 600 | Button labels |
| `.text-eyebrow` | 12px | 600 | Uppercase labels/tags |

### Custom Animations

```css
.animate-badge-pulse   /* 1.4s pulsing dot — used on "Scanning" badges */
.animate-spin          /* 0.75s rotation — used on loading spinners */
```

### Scrollbar Styling

Custom thin scrollbar with `surface-3` thumb on `canvas` track, rounded.

### shadcn Bridge Variables

The `@theme inline` block maps CloudLens tokens to shadcn variable names (`--color-background`, `--color-foreground`, `--color-primary`, etc.) so shadcn primitives render correctly with the CloudLens theme.

---

## 6. Route Map & How Routing Works

CloudLens uses **Next.js App Router** with **route groups** `(public)` and `(dashboard)`:

```
URL Path                     → File                                          → Protected?
─────────────────────────────────────────────────────────────────────────────
/                            → src/app/(public)/page.tsx                     → No
/api/auth/signin             → NextAuth auto-generated sign-in page          → No
/api/auth/callback/github    → NextAuth callback handler                     → No
/api/auth/signout            → NextAuth sign-out handler                     → No
/dashboard                   → src/app/(dashboard)/dashboard/page.tsx        → Yes ✓
/dashboard/repositories      → src/app/(dashboard)/dashboard/repositories/page.tsx → Yes ✓
/dashboard/services          → NOT YET BUILT (sidebar link exists)           → —
/dashboard/alerts            → NOT YET BUILT (sidebar link exists)           → —
/dashboard/costs             → NOT YET BUILT (sidebar link exists)           → —
/dashboard/insights          → NOT YET BUILT (sidebar link exists)           → —
/dashboard/settings          → NOT YET BUILT (sidebar link exists)           → —
```

### How Authentication Works

1. **Middleware** (`middleware.ts`) intercepts all requests matching `/dashboard/:path*`
2. If user has a session (`req.auth` exists) → allow through
3. If no session → redirect to `/api/auth/signin?callbackUrl=<original_url>`
4. After GitHub OAuth succeeds → NextAuth redirect callback sends user to `/dashboard`

### Route Groups Explained

- `(public)` → No layout prefix in URL. Wraps with `PublicNav` + Footer.
- `(dashboard)` → No layout prefix in URL. Wraps with `Sidebar` + `Header`.

The parentheses `()` are Next.js route group syntax — they affect **layout nesting** but don't appear in the URL.

---

## 7. Page 1 — Landing Page (Public Home)

> **Route:** `/`  
> **File:** `src/app/(public)/page.tsx` (465 lines)  
> **Type:** Server Component (async — reads session server-side)  
> **Layout:** `src/app/(public)/layout.tsx` (PublicNav + Footer)

### What This Page Does

The landing/marketing page with 5 sections:

1. **Hero Section** — Headline, subtitle, CTA buttons, terminal demo, logo strip
2. **Features Section** — 6 feature cards in 3×2 grid
3. **How It Works** — 3-step flow (Connect → Scan → Monitor)
4. **Pricing Section** — 4 pricing tiers (Free / Pro / Team / Enterprise)
5. **CTA Banner** — Final call-to-action

### Key Behavior

- **Session-aware CTAs:** If user is logged in, the hero CTA changes from "Connect GitHub" to "Go to Dashboard →"
- **Scroll animations:** Every section uses `<FadeIn>` with staggered delays
- **Terminal demo:** Static code block showing a fake `cloudlens scan` output

### Data Constants (Defined at Top of File)

```typescript
const TERMINAL_CODE = `$ npx cloudlens scan --repo acme-corp/payments-api ...`;

const FEATURES = [
  { title: "Auto-detect Services",  variant: "accent", icon: <svg>...</svg>, description: "..." },
  { title: "GitHub OAuth",          variant: "blue",   icon: <svg>...</svg>, description: "..." },
  { title: "Smart Alerts",          variant: "amber",  icon: <svg>...</svg>, description: "..." },
  { title: "AI-Powered Insights",   variant: "accent", icon: <svg>...</svg>, description: "..." },
  { title: "Cost Tracking",         variant: "blue",   icon: <svg>...</svg>, description: "..." },
  { title: "Architecture Maps",     variant: "amber",  icon: <svg>...</svg>, description: "..." },
];

const STEPS = [
  { num: "01", title: "Connect GitHub",  description: "..." },
  { num: "02", title: "Scan & Detect",   description: "..." },
  { num: "03", title: "Monitor & Save",  description: "..." },
];

const PLANS = [
  { name: "Free",       price: "$0",     period: "forever",  highlighted: false, features: [...] },
  { name: "Pro",        price: "$12",    period: "/month",   highlighted: true,  features: [...] },
  { name: "Team",       price: "$39",    period: "/month",   highlighted: false, features: [...] },
  { name: "Enterprise", price: "Custom", period: "",         highlighted: false, features: [...] },
];

const LOGOS = ["AWS", "GCP", "Azure", "Vercel", "Stripe", "Supabase", "Neon", "Clerk"];
```

### How to Modify

| Change | Where to Edit |
|--------|--------------|
| Hero headline text | Line ~211: `<h1 className="text-display-xl ...">` |
| Hero subtitle | Line ~219: `<p className="text-body-lg ...">` |
| Add/remove features | Edit the `FEATURES` array (line ~28) |
| Change pricing | Edit the `PLANS` array (line ~127) |
| Change logo strip | Edit the `LOGOS` array (line ~193) |
| Change terminal demo | Edit `TERMINAL_CODE` string (line ~8) |
| Modify steps | Edit `STEPS` array (line ~105) |
| Change CTA link target | Lines ~237-244 (hero CTA links) |
| Add a new section | Add a `<section>` block before the closing `</div>` |

### Components Used

- `<FadeIn>` — Scroll-triggered animation wrapper
- `<FeatureCard>` — Feature showcase cards
- `<TerminalCodeBlock>` — macOS-style terminal with syntax highlighting
- `<Link>` — Next.js client-side navigation

---

## 8. Page 2 — Dashboard Overview

> **Route:** `/dashboard`  
> **File:** `src/app/(dashboard)/dashboard/page.tsx` (21 lines)  
> **Type:** Server Component (async — reads session)  
> **Layout:** `src/app/(dashboard)/layout.tsx` (Sidebar + Header shell)

### What This Page Does

Currently a **minimal welcome card**. It:
- Reads the user session server-side
- Displays "Welcome back, {name}!" with a prompt to sync repositories

### Full Code

```typescript
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[rgba(178,182,189,0.1)] bg-surface-1 p-6">
        <h2 className="text-subhead text-ink mb-1">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}!
        </h2>
        <p className="text-body-sm text-ink-muted">
          Your dashboard is ready. Start by syncing your repositories.
        </p>
      </div>
    </div>
  );
}
```

### How to Modify

| Change | Where to Edit |
|--------|--------------|
| Welcome message | Line 12-13: Change the `<h2>` text |
| Add stat cards | Add new `<div>` blocks inside the `<div className="space-y-4">` |
| Add recent activity | Fetch data from DB and render below the welcome card |
| Add quick action buttons | Import `Button` and add below the paragraph |

### What's Planned (Phase 5)

This page will be expanded with:
- **Stat cards** — Total Repos, Total Services, Providers Count
- **Recent scans list** — Last 5 scans with status
- **Quick actions** — "Sync Repos", "Scan All" buttons
- A `StatCard` reusable component

---

## 9. Page 3 — Repositories Page

> **Route:** `/dashboard/repositories`  
> **File:** `src/app/(dashboard)/dashboard/repositories/page.tsx` (40 lines)  
> **Type:** Server Component (async — fetches repos from DB)  
> **Layout:** Inherits from `(dashboard)/layout.tsx`

### What This Page Does

1. Authenticates the user (redirects if not signed in)
2. Looks up the user's DB ID
3. Fetches all repositories from the `repositories` table, ordered by last commit
4. Passes them to the client-side `<RepositoryList>` component

### Server Component Code

```typescript
import { db } from "@/db";
import { repositories, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RepositoryList } from "@/components/RepositoryList";

export const dynamic = "force-dynamic";

export default async function RepositoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  let dbUserId = (session.user as any).id;
  if (!dbUserId && session.user.email) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    dbUserId = dbUser?.id;
  }
  if (!dbUserId) redirect("/api/auth/signin");

  const userRepos = await db
    .select()
    .from(repositories)
    .where(eq(repositories.userId, dbUserId))
    .orderBy(desc(repositories.lastCommitAt));

  return (
    <div className="space-y-6">
      <RepositoryList initialRepos={userRepos} />
    </div>
  );
}
```

### Client Component: `RepositoryList` (292 lines)

**File:** `src/components/RepositoryList.tsx`

This is the main interactive component on this page. It provides:

#### Features
- **Search bar** — Filter repos by name or description
- **Status filter** — All / Never Scanned / Scanning / Scanned / Failed
- **Language filter** — Dynamic dropdown from repo languages
- **Sort** — By Recent Commit or By Name
- **Sync button** — Calls `syncRepositories()` server action, shows loading spinners
- **Repository grid** — 3-column responsive grid of `RepoCard` components
- **Loading state** — 6 `SkeletonRepoCard` skeletons while syncing
- **Empty state** — Helpful message when no repos found (with sync CTA)

#### State Management (React.useState)

```typescript
const [isSyncing, setIsSyncing]       = React.useState(false);
const [searchQuery, setSearchQuery]   = React.useState("");
const [statusFilter, setStatusFilter] = React.useState("all");
const [languageFilter, setLanguageFilter] = React.useState("all");
const [sortBy, setSortBy]             = React.useState("lastCommit");
```

#### How Filtering Works

All filtering is **client-side** via `React.useMemo`. The `filteredRepos` memo:
1. Applies search query (name + description)
2. Applies status filter (maps `pending` → `never-scanned`)
3. Applies language filter
4. Sorts by name or last commit date

#### Custom Select Component

`RepositoryList.tsx` includes an inline `<Select>` component (not from shadcn) styled to match the design system. It wraps a native `<select>` with custom chevron icon.

### How to Modify

| Change | Where to Edit |
|--------|--------------|
| Add a new filter | Add state + `<Select>` in toolbar + filter logic in `filteredRepos` memo |
| Change grid columns | Line ~210/216: Change `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| Change what RepoCard shows | Edit `RepoCard.tsx` props or the mapping in `RepositoryList.tsx` |
| Change empty state message | Lines ~274-286 in `RepositoryList.tsx` |
| Change sync behavior | Edit `handleSync()` function or `syncRepositories()` in `actions.ts` |
| Add "Scan Now" per repo | Add a button in `RepoCard` that triggers a scan server action |

---

## 10. Page 4 — NextAuth Sign-in (Auto-generated)

> **Route:** `/api/auth/signin`  
> **File:** Auto-generated by NextAuth  
> **Type:** NextAuth default UI

NextAuth v5 generates its own sign-in page. When users hit this route:
1. They see a "Sign in with GitHub" button
2. Clicking it redirects to GitHub OAuth
3. After authorizing, they're redirected back to the callback URL
4. The `redirect` callback in `auth.ts` sends them to `/dashboard`

### How to Customize the Sign-in Page

To replace the default NextAuth sign-in page with a custom one:

1. Create `src/app/auth/signin/page.tsx`
2. In `auth.ts`, add to the NextAuth config:
   ```typescript
   pages: {
     signIn: "/auth/signin",
   }
   ```
3. Use the `signIn("github")` function from `next-auth/react` in your custom page

---

## 11. Layout Files

### Root Layout — `src/app/layout.tsx`

**What it does:**
- Loads the **Inter** font from Google Fonts (weights 500, 600, 700)
- Sets the font CSS variable `--ff-sans`
- Applies dark mode (`class="dark"`) to `<html>`
- Wraps the entire app in `<SessionProvider>` for NextAuth
- Sets SEO metadata (title, description, OpenGraph, Twitter cards)

```typescript
export const metadata: Metadata = {
  title: "CloudLens — Developer Intelligence Platform",
  description: "Automatically detect, track, and monitor every cloud service...",
  keywords: ["cloud services", "developer tools", "GitHub", ...],
  openGraph: { ... },
  twitter: { ... },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

**To change the font:** Modify the `Inter` import and `inter` constant (lines 2, 6-11).

---

### Public Layout — `src/app/(public)/layout.tsx`

**What it does:**
- Renders the `<PublicNav>` top navigation bar
- Renders children (page content) in a `<main>` tag
- Renders a full-width footer with 4 link columns

**Footer columns:** Product, Developers, Company, Legal (defined in `FOOTER_COLS` array at top of file)

**To modify footer links:** Edit the `FOOTER_COLS` array (lines 5-38).

---

### Dashboard Layout — `src/app/(dashboard)/layout.tsx`

**What it does:**
- Server component that checks authentication
- If no session → redirects to sign-in
- If authenticated → renders `<DashboardShell>` with user name + avatar

```typescript
export default async function DashboardLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  return (
    <DashboardShell userName={session.user.name} userImage={session.user.image}>
      {children}
    </DashboardShell>
  );
}
```

---

### DashboardShell — `src/app/(dashboard)/DashboardShell.tsx`

**What it does:**
- Client component owning the mobile sidebar toggle state
- Renders: `Sidebar` (left) + `Header` (top) + scrollable `<main>` (content area)
- Full-height flexbox layout (`h-screen overflow-hidden`)

```
┌──────────┬────────────────────────────────────────┐
│          │ Header (sticky, 64px tall)             │
│ Sidebar  ├────────────────────────────────────────┤
│ (224px)  │                                        │
│          │ <main> — scrollable content area       │
│          │ (padding: 16px mobile, 24px desktop)   │
│          │                                        │
└──────────┴────────────────────────────────────────┘
```

---

## 12. Layout Components (Sidebar, Header, PublicNav)

### Sidebar — `src/components/layout/Sidebar.tsx` (196 lines)

**Type:** Client Component  

**What it does:**
- Renders the left navigation panel (224px wide / `w-56`)
- Logo mark (4-square SVG) + "CloudLens" wordmark at top
- Navigation links grouped into 3 sections:
  - **Main:** Overview, Repositories, Services, Alerts
  - **Finance & AI:** Costs, AI Insights
  - **Account:** Settings
- Active route highlighting via `usePathname()` comparison
- Mobile: slide-in drawer with backdrop overlay
- Desktop: sticky, always visible
- Version tag at bottom: "CloudLens v1.0.0"

**Nav items defined in `NAV_GROUPS` array (line 48):**

```typescript
const NAV_GROUPS = [
  {
    title: "Main",
    items: [
      { label: "Overview",      href: "/dashboard",              icon: ... },
      { label: "Repositories",  href: "/dashboard/repositories", icon: ... },
      { label: "Services",      href: "/dashboard/services",     icon: ... },
      { label: "Alerts",        href: "/dashboard/alerts",       icon: ... },
    ],
  },
  {
    title: "Finance & AI",
    items: [
      { label: "Costs",         href: "/dashboard/costs",        icon: ... },
      { label: "AI Insights",   href: "/dashboard/insights",     icon: ... },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Settings",      href: "/dashboard/settings",     icon: ... },
    ],
  },
];
```

**To add a new sidebar link:** Add an entry to the relevant group in `NAV_GROUPS`.

**Props:**
```typescript
interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}
```

---

### Header — `src/components/layout/Header.tsx` (132 lines)

**Type:** Client Component  

**What it does:**
- Sticky header bar at the top of the dashboard
- Displays the current page title (derived from route via `usePageTitle()`)
- Search input (currently visual only — no search logic wired)
- Notification bell button (placeholder — no dropdown yet)
- User avatar (from GitHub) + username
- Mobile hamburger button to open the sidebar

**Route → Title mapping:**

```typescript
const map = {
  "/dashboard":              "Overview",
  "/dashboard/repositories": "Repositories",
  "/dashboard/services":     "Services",
  "/dashboard/alerts":       "Alerts",
  "/dashboard/costs":        "Costs",
  "/dashboard/insights":     "AI Insights",
  "/dashboard/settings":     "Settings",
};
```

**Props:**
```typescript
interface HeaderProps {
  userName?: string | null;
  userImage?: string | null;
  onMenuClick?: () => void;
}
```

**To add a new page title:** Add an entry to the `map` object inside `usePageTitle()` (line 11).

---

### PublicNav — `src/components/layout/PublicNav.tsx` (121 lines)

**Type:** Client Component  

**What it does:**
- Sticky top navigation for the landing page
- Logo + "CloudLens" wordmark (links to `/`)
- Desktop nav links: Features, How It Works, Pricing (anchor links to sections)
- Session-aware CTAs:
  - Authenticated → "Dashboard →" button
  - Unauthenticated → "Sign in" (ghost) + "Sign up" (primary) buttons
- Mobile hamburger menu with dropdown

**Nav links:**
```typescript
const NAV_LINKS = [
  { label: "Features",     href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing",      href: "/#pricing" },
];
```

---

## 13. UI Primitive Components

All UI primitives live in `src/components/ui/` and use **CVA (class-variance-authority)** for variant management.

### Button — `src/components/ui/button.tsx` (157 lines)

**Variants:**

| Variant | Appearance |
|---------|-----------|
| `primary` | White bg, black text |
| `secondary` | Dark surface bg, white text |
| `tertiary` | Transparent, border, ghost-like |
| `danger` | Red tinted, error text |
| `ghost` | Transparent, muted text, border |
| `product-terraform` | Purple bg |
| `product-vault` | Yellow bg |
| `product-waypoint` | Teal bg |

**Sizes:** `default` (40px tall) | `sm` (34px tall)

**Special Props:**
- `loading?: boolean` — Replaces icon with animated spinner, disables button
- `icon?: ReactNode` — Leading icon slot

**Usage:**
```tsx
<Button variant="primary" size="default" loading={isSyncing}>
  Sync Repos
</Button>
```

---

### Badge — `src/components/ui/badge.tsx` (107 lines)

**Variants:**

| Variant | Use | Colors |
|---------|-----|--------|
| `aws` | AWS provider | Yellow tint |
| `gcp` | GCP provider | Blue tint |
| `azure` | Azure provider | Blue tint |
| `vercel` | Vercel provider | Neutral surface |
| `stripe` | Stripe provider | Purple tint |
| `supabase` | Supabase provider | Green tint |
| `complete` | Scan complete | Green |
| `scanning` | Scan in progress | Yellow + pulse |
| `failed` | Scan failed | Red |
| `never-scanned` | Never scanned | Muted, no dot |
| `default` | Generic | Neutral |
| `info` | Informational | Blue |

**Special:**
- All badges except `never-scanned` show a colored dot indicator by default
- The `scanning` variant dot has a pulsing animation (`animate-badge-pulse`)
- Control dot visibility with `showDot` prop

**Usage:**
```tsx
<Badge variant="aws" size="sm">AWS · 4</Badge>
<Badge variant="scanning">Scanning</Badge>
```

---

### Card — `src/components/ui/card.tsx` (152 lines)

**Variants:**

| Variant | Appearance |
|---------|-----------|
| `default` | `bg-surface-1` |
| `featured` | `bg-surface-2` + visible border |
| `interactive` | Hover effect (bg lifts to surface-2) |
| `product-*` | Product-colored cards (terraform, vault, etc.) |

**Padding variants:** `default` (p-6) | `compact` (p-4) | `spacious` (p-8) | `none`

**Sub-components:** `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

---

### Input — `src/components/ui/input.tsx` (122 lines)

**Features:**
- Search icon (magnifying glass) shown by default
- Focus ring animation (`accent-blue` glow)
- Trailing slot for keyboard shortcuts or icons
- Sizes: `default` (40px) | `sm` (34px) | `lg` (48px)

**Usage:**
```tsx
<Input placeholder="Search repositories..." value={query} onChange={...} />
```

---

## 14. Composite Components

### FeatureCard — `src/components/FeatureCard.tsx` (51 lines)

**Used on:** Landing page Features section

**Props:**
```typescript
interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  variant?: "default" | "accent" | "blue" | "amber";
}
```

**What it renders:** A Card with an icon container (colored by variant), title, and description.

---

### TerminalCodeBlock — `src/components/TerminalCodeBlock.tsx` (202 lines)

**Used on:** Landing page hero section

**Props:**
```typescript
interface TerminalCodeBlockProps {
  title?: string;        // Tab title (e.g., "cloudlens scan")
  code?: string;         // The code string to render
  language?: "bash" | "typescript" | "json" | string;
}
```

**What it renders:**
- macOS-style window chrome (3 colored dots: red, yellow, green)
- Title tab on the right
- Syntax-highlighted code block with mono font

**Syntax highlighting is manual** — the `highlightBashLine()` function parses each line and wraps keywords, commands, checkmarks, service names, etc. in colored `<span>` elements.

---

### RepoCard — `src/components/RepoCard.tsx` (129 lines)

**Used on:** Repositories page grid

**Props:**
```typescript
interface RepoCardProps {
  name: string;
  owner: string;
  status: "complete" | "scanning" | "failed" | "never-scanned";
  services: RepoService[];        // Array of { provider, count }
  serviceCount: number;
  updatedAt: string;              // "2h ago", "Never scanned", etc.
  onViewClick?: (e) => void;
}
```

**What it renders:**
- Card header: repo name + owner + status badge
- Service badges (AWS · 4, Stripe · 1, etc.)
- Footer: service count + timestamp + "View →" button
- Clickable (whole card triggers `onViewClick` unless scanning)

---

### AlertCard — `src/components/AlertCard.tsx` (85 lines)

**Used on:** Future alerts page (component is built, page is not)

**Props:**
```typescript
interface AlertCardProps {
  provider: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: ReactNode;
  repoName: string;
  timestamp: string;
}
```

**What it renders:** Card with colored left border (by severity), provider badge, title, description, repo/timestamp footer.

---

### StatusBar — `src/components/StatusBar.tsx` (48 lines)

**Used on:** Designed for status indicators (not yet used on any page)

**Props:**
```typescript
interface StatusBarProps {
  label: string;
  dotColor?: "success" | "warning" | "error" | "blue" | "muted" | string;
  pulse?: boolean;
}
```

**What it renders:** Inline pill with colored dot + uppercase monospace label.

---

### SkeletonRepoCard — `src/components/SkeletonRepoCard.tsx` (32 lines)

**Used on:** Repositories page (during sync loading)

**What it renders:** A pulsing (`animate-pulse`) placeholder card matching RepoCard layout — fake title/owner bars, fake badge bars, fake footer bars.

---

### FadeIn — `src/components/FadeIn.tsx` (47 lines)

**Used on:** Landing page (every section)

**Props:**
```typescript
interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;                // seconds
  direction?: "up" | "down" | "left" | "right" | "none";
}
```

**What it does:** Uses Framer Motion's `useInView` to trigger a fade+slide animation when the element scrolls into view. Fires once (`once: true`).

---

### SessionProvider — `src/components/SessionProvider.tsx` (9 lines)

**What it does:** Thin wrapper around NextAuth's `SessionProvider` to make it a client component (required because root layout is a server component).

```typescript
"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

---

## 15. Server Actions

### `syncRepositories()` — `src/app/actions.ts` (80 lines)

**What it does:**
1. Authenticates the user (reads session, looks up DB user ID)
2. Calls `getUserRepos(accessToken)` to fetch all repos from GitHub API
3. Upserts repos into the `repositories` table in chunks of 100
4. Uses `onConflictDoUpdate` to update existing repos on `(userId, githubId)` conflict
5. Calls `revalidatePath("/dashboard/repositories")` to refresh the page cache
6. Returns `{ success: true, count: N }`

**Called from:** `RepositoryList.tsx` → `handleSync()` button handler

---

## 16. Middleware & Auth

### Middleware — `middleware.ts`

```typescript
import { auth } from "@/lib/auth";

export default auth((req) => {
  if (req.auth) return NextResponse.next();
  
  const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
  signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

**What it does:** Protects all `/dashboard/*` routes. Unauthenticated users are redirected to sign-in with a callback URL.

---

### Auth Config — `src/lib/auth.ts` (83 lines)

**Provider:** GitHub OAuth with scopes: `read:user`, `user:email`, `repo`

**Key callbacks:**
- `jwt()` — Stores GitHub `access_token` in the JWT
- `session()` — Exposes `accessToken` on the session object
- `redirect()` — Sends users to `/dashboard` after sign-in

**Exported:** `auth`, `signIn`, `signOut`, `handlers`, `getGitHubAccessToken()`

---

### Type Augmentation — `src/types/next-auth.d.ts`

Extends NextAuth types to include `accessToken` on both `Session` and `JWT`:

```typescript
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    providerAccountId?: string;
  }
}
```

---

## 17. API Routes

### `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

**What it does:** Exposes all NextAuth routes:
- `GET /api/auth/signin` — Sign-in page
- `POST /api/auth/signin/github` — Initiate GitHub OAuth
- `GET /api/auth/callback/github` — OAuth callback handler
- `GET /api/auth/session` — Get current session
- `POST /api/auth/signout` — Sign out

---

## 18. Missing Pages (To Be Built in Future Phases)

These pages have **sidebar links** and **header title mappings** already defined, but the actual page files do not exist yet:

| Route | Phase | What It Will Do |
|-------|-------|----------------|
| `/dashboard/services` | Phase 5 | Grid of all detected cloud services across all repos, with filters by provider/category/confidence |
| `/dashboard/alerts` | Phase 6 | Filterable/sortable alert history with dismiss/snooze actions |
| `/dashboard/costs` | Phase 10 | Monthly burn rate, cost breakdown charts (Recharts), wasted spend metrics |
| `/dashboard/insights` | Phase 7 | AI-powered recommendations, security findings, per-recommendation actions |
| `/dashboard/settings` | Phase 5 | Profile info, connected accounts, notification prefs, danger zone |
| `/dashboard/repositories/[id]` | Phase 5 | Individual repo detail — detected services with evidence, re-scan button |
| `/dashboard/repositories/[id]/architecture` | Phase 8 | Interactive React Flow architecture map of repo's cloud dependencies |

### How to Create a New Dashboard Page

1. Create the file: `src/app/(dashboard)/dashboard/<page-name>/page.tsx`
2. The page automatically inherits the Sidebar + Header layout
3. Add a title entry in `Header.tsx` → `usePageTitle()` map (if not already there)
4. If it's a new sidebar link, add it to `Sidebar.tsx` → `NAV_GROUPS`

**Example scaffold:**
```typescript
// src/app/(dashboard)/dashboard/services/page.tsx
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <h2 className="text-subhead text-ink">All Services</h2>
      {/* Build your content here */}
    </div>
  );
}
```

---

## 19. Quick-Reference: Where to Edit for Common Changes

| What You Want to Change | File to Edit |
|------------------------|-------------|
| **App title / SEO meta** | `src/app/layout.tsx` → `metadata` object |
| **Font** | `src/app/layout.tsx` → `Inter` import + `globals.css` `--ff-sans` |
| **Color palette** | `src/app/globals.css` → `:root` block |
| **Add a Tailwind utility** | `tailwind.config.ts` → `theme.extend` |
| **Typography scale** | `src/app/globals.css` → `.text-*` utility classes |
| **Landing page content** | `src/app/(public)/page.tsx` → data constants + JSX |
| **Landing page nav links** | `src/components/layout/PublicNav.tsx` → `NAV_LINKS` |
| **Footer links** | `src/app/(public)/layout.tsx` → `FOOTER_COLS` |
| **Sidebar nav links** | `src/components/layout/Sidebar.tsx` → `NAV_GROUPS` |
| **Header page titles** | `src/components/layout/Header.tsx` → `usePageTitle()` map |
| **Button styles** | `src/components/ui/button.tsx` → `buttonVariants` |
| **Badge styles** | `src/components/ui/badge.tsx` → `badgeVariants` |
| **Card styles** | `src/components/ui/card.tsx` → `cardVariants` |
| **Repository card layout** | `src/components/RepoCard.tsx` |
| **Repo list filtering** | `src/components/RepositoryList.tsx` → `filteredRepos` memo |
| **GitHub repo sync logic** | `src/app/actions.ts` → `syncRepositories()` |
| **Auth provider / scopes** | `src/lib/auth.ts` → `GitHub()` config |
| **Protected routes** | `middleware.ts` → `config.matcher` |
| **Database schema** | `src/db/schema.ts` (run `drizzle-kit push` after changes) |
| **GitHub API functions** | `src/lib/github.ts` |
| **Allowed image domains** | `next.config.ts` → `images.remotePatterns` |
| **Add new shadcn component** | Run `npx shadcn add <component>` in `cloudlens/` |
| **Animation behavior** | `src/components/FadeIn.tsx` (Framer Motion settings) |
| **Scrollbar appearance** | `src/app/globals.css` → scrollbar section |

---

> **Tip:** All import paths use `@/` aliases. The `cn()` utility from `@/lib/utils` merges Tailwind classes safely — always use it when combining conditional classes.

> **Running the project:**
> ```bash
> cd cloudlens
> cp .env.example .env    # Fill in your values
> npm install
> npm run dev             # → http://localhost:3000
> ```
