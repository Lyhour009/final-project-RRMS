# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

RRMS — a Room Rental Management System for a rental property operator. Next.js 16 (App Router) + React 19 + TypeScript + Supabase (Auth, Postgres with RLS, Storage), styled with Tailwind v4 and shadcn-style components. Two portals share one codebase: `admin` (property operator) and `tenant` (self-service), gated by a `profiles.role` column and enforced at three layers — proxy, server actions, and Postgres RLS.

User-facing error/validation strings in server actions are written in **Khmer**, not English — match that convention when adding new actions.

## Commands

```bash
npm run dev                # Start dev server
npm run build               # Production build
npm run lint                 # ESLint
npx tsc --noEmit             # Type check (no dedicated script; run this directly)
npm test                     # Node test runner over tests/*.test.mjs (security regression tests)
npm run test:e2e             # Playwright E2E (tests/e2e/) — starts its own dev server unless E2E_BASE_URL is set
npm run verify:production    # Post-deploy Supabase config smoke test (scripts/verify-production.ts)
```

Run a single Node test file: `node --test tests/security.test.mjs`
Run a single Playwright test: `npx playwright test tests/e2e/auth-flow.spec.ts`

CI (`.github/workflows/quality.yml`) runs, in order: lint → `tsc --noEmit` → `npm test` → `npm run build`. Match this locally before pushing.

Admin password reset (requires service-role key in `.env.local`, local trusted use only):

```bash
npx tsx scripts/reset-admin-password.ts <user-id> <new-password>
```

## Critical: this is not the Next.js you know

Per `AGENTS.md`, this Next.js version has breaking changes from what you may expect — check `node_modules/next/dist/docs/` before assuming an API. The one that matters most here:

- **`middleware.ts` is gone — it's `src/proxy.ts`.** Next.js 16 renamed Middleware to Proxy (same mechanics, new file/export name: `export async function proxy(request)`). This file does route protection (redirect unauthenticated users, block cross-role access) and is the _first_ of three enforcement layers described below — never treat it as sufficient on its own.

## Authorization: three layers, all required

Every protected action must be safe even if the other two layers were bypassed:

1. **`src/proxy.ts`** — redirects based on `profiles.role`, matched against `/admin/*` and `/tenant/*` path prefixes. Optimistic/UX-level only.
2. **`src/lib/supabase/server.ts`** — `requireAdmin()` / `requireTenant()` / `requireUser()`. Called at the top of every Server Action. Re-validates via `supabase.auth.getUser()` (a real round-trip, not a decoded JWT) and cross-checks `profiles.role` against `user.app_metadata.role` — both must agree. This is the layer that actually protects Server Actions, since a Server Action is a POST endpoint that stays reachable even if a route is moved off a proxy-protected path.
3. **Postgres RLS** (`supabase/rls-policies.sql`) — the backstop if application code has a bug. E.g. tenants cannot self-promote to admin (`profiles_update_self_or_admin` policy checks `public.is_admin()`, not `id = auth.uid()`).

When adding a new Server Action, always start with `const { supabase } = await requireAdmin()` (or `requireTenant`/`requireUser`) — don't assume the route-level proxy check is enough.

`getAuthenticatedUser()` in `server.ts` is wrapped in React's `cache()` — this dedupes the auth round-trip _within one request_ only (e.g. a layout + multiple `Promise.all`'d data-fetchers on the same navigation), never across requests. Don't reuse this expecting cross-request caching.

## Server-only boundaries

Two modules are marked `import "server-only"` and must never be imported into client-bundled code:

- `src/lib/supabase/admin.ts` — service-role client, bypasses RLS entirely.
- `src/lib/notifications.ts` — inserts notifications via the admin client directly (no public `createNotification` Server Action exists on purpose, so the browser can never fire arbitrary notifications).

`tests/security.test.mjs` asserts on these boundaries by grepping source — if you touch either file, keep the `server-only` import and the absence of a client-reachable `createNotification` export intact, or the regression test will fail.

## Directory layout

```text
src/
  proxy.ts                  Route protection + session refresh (Next 16 "Proxy", see above)
  app/
    (dashboard)/admin/*      Admin pages (rooms, tenants, contracts, billing, payments, maintenance, reports, settings)
    (dashboard)/tenant/*      Tenant self-service pages
    (dashboard)/profile/     Shared profile page
    api/health, api/cron/    Health check + status-sync cron (protected by CRON_SECRET, timing-safe compare)
    login/                   Auth screen (no self-service password reset — see scripts/reset-admin-password.ts)
  actions/                   Server Actions ("use server"), grouped by domain; admin- and tenant-facing
                              actions for the same domain are split, e.g. bills.ts vs tenants/bills.ts
  components/                Feature components grouped by domain (bill/, contract/, payment/, room/, ...) + components/ui/ (shadcn primitives)
  lib/
    supabase/                client.ts (browser), server.ts (per-request server client + requireX guards), admin.ts (service-role, server-only)
    validations/             Zod schemas, mirrors actions/ domain grouping
  hooks/
supabase/
  rls-policies.sql           Apply first
  migrations/                Apply in filename order after rls-policies.sql
tests/
  security.test.mjs          Source-grepping regression tests for the auth/RLS invariants above
  e2e/                       Playwright specs
```

Within `actions/`, admin and tenant logic for the same domain live in separate files (e.g. `actions/bills.ts` for admin vs `actions/tenants/bills.ts` for tenant self-service) rather than one file branching on role — follow this split for new domains.

## Data flow conventions

- Every Server Action starts with a `requireX()` guard, then a Zod `safeParse` (schemas in `lib/validations/`) before touching Supabase.
- Mutations call `revalidatePath()` explicitly — `next.config.ts` sets `experimental.staleTimes.dynamic = 60`, so without an explicit revalidate, cross-page navigation could briefly serve stale cached data for up to 60s.
- File uploads (room images, tenant documents, payment proofs) are validated for MIME type and size server-side; `room-images` is a public bucket, `tenants` and `payment-proofs` are private.
- Supabase RLS is the last line of defense, not the primary one — application code must not rely on RLS alone for authorization it can check earlier.

## Supabase setup order

This repo assumes base tables already exist in a Supabase project (created remotely, not via a migration in this repo). To (re)apply policy/schema state:

1. `supabase/rls-policies.sql`
2. `supabase/migrations/*` in filename order
3. `npm run verify:production` against a dedicated test tenant account

Never commit a data dump, the service-role key, or real tenant data — see `docs/PUBLIC_REPO_CHECKLIST.md`.
