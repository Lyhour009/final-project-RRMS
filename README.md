# RRMS — Room Rental Management System

A full-stack room/tenant management platform for rental property operators, with separate admin and tenant portals. Built with Next.js App Router, Supabase (Postgres + Auth), and Tailwind CSS v4.

## Features

**Admin portal**
- Dashboard with occupancy, revenue, and trend charts
- Room management (status, pricing, images)
- Tenant management (profiles, contact info, ID documents)
- Contracts (create, terminate, track active/historical leases)
- Billing (monthly bill generation from room + utility rates)
- Payments (record, approve/reject, track method)
- Maintenance request tracking
- Reports with Excel export
- Staff/settings management

**Tenant portal**
- Personal dashboard
- View contract details
- View and pay bills
- Submit and track maintenance requests
- Payment history

**Cross-cutting**
- Role-based auth (admin / tenant) via Supabase Auth + `profiles` table
- Server Actions for all mutations, with `revalidatePath` cache invalidation
- Infinite-scroll tables (10 rows at a time) for large datasets, independent of full-data Excel export
- Light/dark theming
- Khmer-language UI

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions, Turbopack) |
| UI | React 19, Tailwind CSS v4, shadcn/Base UI components |
| Data & Auth | [Supabase](https://supabase.com) (Postgres, Auth, Storage) |
| Forms & Validation | React Hook Form + Zod |
| Charts | Recharts |
| Tables | TanStack Table |
| Exports | xlsx, @react-pdf/renderer, jsPDF |
| State | Zustand, TanStack Query |
| Testing | Playwright |

> **Note:** This project pins Next.js 16.2.7, which has behavioral differences from the version most training data and tutorials assume. Check `node_modules/next/dist/docs/` before relying on unfamiliar API behavior.

## Getting Started

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project (Postgres database + Auth enabled)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment template and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public API key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-only — never expose client-side) |

3. Run the dev server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # production build
npm run start   # run a production build
npm run lint    # eslint
```

## Project Structure

```
src/
  app/
    (dashboard)/
      admin/        # admin-only routes (rooms, tenants, contracts, billing, payments, maintenance, reports, settings)
      tenant/        # tenant-only routes (dashboard, bills, contracts, maintenance, payments, settings)
      profile/
    login/
  actions/           # Server Actions (mutations + data fetching), split by domain and admin/tenant
  components/         # UI components, grouped by feature (room, tenant, contract, bill, payment, dashboard, report, ...)
  hooks/              # shared client hooks (e.g. infinite-scroll reveal)
  lib/
    supabase/          # Supabase client factories + auth helpers (requireAdmin, requireUser)
    validations/       # Zod schemas
```

Access control is enforced server-side: every admin action calls `requireAdmin()` and every tenant action calls `requireUser()` from `src/lib/supabase/server.ts`, which verify the session and role before touching data.

## Deployment

Deploy like any Next.js app (Vercel, or any Node-capable host). Set the same three Supabase environment variables in your hosting provider's dashboard before deploying.
