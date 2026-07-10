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
| Data & Auth | [Supabase](https://supabase.com) (Postgres, Auth, Storage) |
| Forms & Validation | React Hook Form + Zod |
| Charts | Recharts |
| Tables | TanStack Table |
| Exports | xlsx, @react-pdf/renderer, jsPDF |
| State | Zustand, TanStack Query |
| Testing | Playwright |

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

3. **Run the dev server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) 🎉

### Other scripts

```bash
npm run build   # production build
npm run start   # run a production build
npm run lint    # eslint
```

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
```

🔒 Access control is enforced server-side: every admin action calls `requireAdmin()` and every tenant action calls `requireUser()` from `src/lib/supabase/server.ts`, which verify the session and role before touching data.

---

## ☁️ Deployment

Deploy like any Next.js app (Vercel, or any Node-capable host). Set the same three Supabase environment variables in your hosting provider's dashboard before deploying.

---

<div align="center">

Made with ❤️ for better rental property management

</div>
