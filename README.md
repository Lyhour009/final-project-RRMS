<div align="center">

# 🏢 RRMS
### Room Rental Management System

A full-stack room/tenant management platform for rental property operators,
with separate **Admin** and **Tenant** portals.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Playwright](https://img.shields.io/badge/Tested%20with-Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![License](https://img.shields.io/badge/License-Private-lightgrey)](#)

</div>

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Deployment](#-deployment)

---

## ✨ Features

<table>
<tr>
<td valign="top" width="50%">

### 🛠️ Admin Portal
- 📊 Dashboard with occupancy, revenue, and trend charts
- 🏠 Room management (status, pricing, images)
- 👥 Tenant management (profiles, contact info, ID documents)
- 📄 Contracts — create, terminate, track active/historical leases
- 💵 Billing — monthly bill generation from room + utility rates
- 💳 Payments — record, approve/reject, track method
- 🔧 Maintenance request tracking
- 📈 Reports with Excel export
- ⚙️ Staff/settings management

</td>
<td valign="top" width="50%">

### 🙋 Tenant Portal
- 🧾 Personal dashboard
- 📄 View contract details
- 💳 View and pay bills
- 🔧 Submit and track maintenance requests
- 🕓 Payment history

</td>
</tr>
</table>

### 🔄 Cross-cutting
- 🔐 Role-based auth (admin / tenant) via Supabase Auth + `profiles` table
- ⚡ Server Actions for all mutations, with `revalidatePath` cache invalidation
- ♾️ Infinite-scroll tables (10 rows at a time) for large datasets, independent of full-data Excel export
- 🌗 Light/dark theming
- 🇰🇭 Khmer-language UI

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions, Turbopack) |
| UI | React 19, Tailwind CSS v4, shadcn/Base UI components |
| Data & Auth | [Supabase](https://supabase.com) (Postgres + Row Level Security, Auth, Storage) |
| Forms & Validation | React Hook Form + Zod (validated both client-side and again server-side in every Server Action) |
| Charts | Recharts |
| Tables | Hand-rolled, with client-side search/filter and progressive scroll reveal |
| Exports | xlsx (dynamically imported so it doesn't bloat the initial page bundle) |
| State | Zustand, TanStack Query |
| Testing | Playwright (scaffolded — not yet covering core admin/tenant flows) |

> **Note:** This project pins Next.js 16.2.7, which has behavioral differences from the version most training data and tutorials assume. Check `node_modules/next/dist/docs/` before relying on unfamiliar API behavior.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project (Postgres database + Auth enabled)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Copy the environment template** and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public API key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-only — never expose client-side) |

3. **Apply the Row Level Security policies** — run [`supabase/rls-policies.sql`](supabase/rls-policies.sql) in your Supabase project's SQL Editor. This is required, not optional: without it, the anon key (which is public — it ships in every browser bundle) can read/write the `profiles`, `contracts`, `bills`, `payments`, `maintenance_requests`, `settings`, and `rooms` tables directly through Supabase's REST API, completely bypassing this app's own access checks. See [Security](#-security) below for why.

   Re-run this file after every policy change. In particular, the current
   policy intentionally prevents users from updating their own `role` and
   does not permit browser clients to insert arbitrary notifications.

4. **Harden the Supabase project before production**

   - Disable public user registration in **Authentication → Providers → Email**.
     Tenant accounts are provisioned by an authenticated administrator.
   - Keep `room-images` public, but keep `tenants` and `payment-proofs` private.
   - Set both private buckets to a 5 MB file limit and allow only JPEG, PNG,
     and WebP images.
   - Configure production URL/redirect allowlists in Supabase Authentication.

5. **Run the dev server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) 🎉

### Other scripts

```bash
npm run build   # production build
npm run start   # run a production build
npm run lint    # eslint
npm test        # security regression tests
```

### Admin utility scripts

```bash
npx tsx scripts/reset-admin-password.ts <user-id> <new-password>
```

Directly resets a Supabase Auth user's password via the service-role key — useful when the dashboard's "send recovery email" flow can't be used (e.g. a non-deliverable admin email domain). Takes the user ID and new password as arguments; never hardcode credentials into this file.

---

## 🗂️ Project Structure

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
  proxy.ts             # Next.js 16's middleware (route-level auth + role redirects)
scripts/                # one-off admin/ops scripts (e.g. password reset)
supabase/               # SQL to apply directly in the Supabase dashboard (RLS policies)
```

---

## 🔒 Security

Access control is enforced in three independent layers — each one assumes the others might fail:

1. **Edge / routing** — [`src/proxy.ts`](src/proxy.ts) (Next 16's rename of `middleware.ts`) checks the session on every request and redirects unauthenticated users to `/login`, and redirects each role away from the other's routes (tenant → `/admin/*` bounces to `/tenant/dashboard`, and vice versa).
2. **Server Actions** — every admin action calls `requireAdmin()` and every tenant action calls `requireUser()` from `src/lib/supabase/server.ts`, which re-verify the session and role before touching data. This matters because a Server Action is its own callable endpoint — it stays protected even if a future refactor moves it off a proxy-guarded route.
3. **Database (Row Level Security)** — [`supabase/rls-policies.sql`](supabase/rls-policies.sql) enforces access at the Postgres level, scoped by `auth.uid()`. This is the layer that actually matters if someone bypasses the Next.js app entirely and calls the Supabase REST API directly with the public anon key — which anyone can do, since that key ships in the browser bundle by design. **Layers 1 and 2 alone are not sufficient without this.**

Inputs are validated with the same Zod schema on both the client (via `zodResolver`) and again inside the Server Action (via `safeParse`) — client-side validation alone is trivially bypassed by posting `FormData` directly, so every mutating action re-validates server-side. File uploads are checked server-side for type and size for the same reason.

---

## ☁️ Deployment

Deploy like any Next.js app (Vercel, or any Node-capable host).

1. Set the three Supabase environment variables in your hosting provider's dashboard.
2. Confirm [`supabase/rls-policies.sql`](supabase/rls-policies.sql) has been applied to your Supabase project (see [Getting Started](#-getting-started)) — this is easy to forget since the app runs fine without it, but it's the only thing standing between the public anon key and your entire database.

---

<div align="center">

Made with ❤️ for better rental property management

</div>
