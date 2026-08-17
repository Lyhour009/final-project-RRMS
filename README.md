# RRMS

Room Rental Management System built with Next.js, Supabase, and TypeScript.

RRMS helps a rental property operator manage rooms, tenants, contracts, monthly bills, payment approvals, maintenance requests, reports, and tenant self-service in one web application.

For a non-technical walkthrough of how the system is used day to day (useful when explaining it to a client or business owner), see [docs/WORKFLOW.md](docs/WORKFLOW.md). For an honest audit of what's built, what was cleaned up, and what's intentionally out of scope (useful before a demo or code review), see [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).

## Features

Admin portal:

- Dashboard with occupancy, revenue, payment, room, billing, and maintenance summaries.
- Room management with images, pricing, floor, status, and notes.
- Tenant management with contact details and private document storage.
- Contract management for active, ended, and terminated leases.
- Monthly bill generation from room rent and utility readings.
- Payment tracking with proof upload, approval, rejection, and history.
- Maintenance request tracking and status updates.
- Reports with CSV export (opens directly in Excel).
- Settings for payment QR code and billing defaults.

Tenant portal:

- Tenant dashboard with current room, rent, balance, and contract status.
- Bill list and bill details.
- Payment submission with proof upload.
- Payment history.
- Contract details.
- Maintenance request submission and tracking.

Security and operations:

- Supabase Auth with admin and tenant roles.
- Route protection in `src/proxy.ts`.
- Server-side role checks before every protected action.
- Supabase Row Level Security policies.
- Server-side validation with Zod.
- File upload type and size checks.
- Health check endpoint and scheduled status sync.
- Production hardening SQL and deployment runbook.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS v4, Base UI/shadcn-style components |
| Backend | Next.js Server Actions |
| Database/Auth/Storage | Supabase |
| Validation | Zod, React Hook Form |
| Charts | Recharts |
| Tables | TanStack Table and custom table components |
| State/Data | Zustand, TanStack Query |
| Testing | Node test runner, Playwright |

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project with Auth, Database, and Storage enabled

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env.local
```

3. Fill in the required variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CRON_SECRET=generate-a-long-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Apply Supabase SQL in this order:

- `supabase/rls-policies.sql`
- `supabase/migrations/202607180001_production_hardening.sql`

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev                # Start development server
npm run build              # Create production build
npm run start              # Start production server after build
npm run lint               # Run ESLint
npx tsc --noEmit           # Run TypeScript checks
npm test                   # Run security regression tests
npm run test:e2e           # Run Playwright E2E tests
npm run verify:production  # Verify production Supabase configuration
```

Admin password reset utility:

```bash
npx tsx scripts/reset-admin-password.ts <user-id> <new-password>
```

Use this only with a trusted local `.env.local` because it requires the Supabase service-role key.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL. This is safe to expose to the browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key. This is public by design, but must be protected by RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only Supabase key for admin operations. Never expose it in client code or commits. |
| `CRON_SECRET` | Yes in production | Secret used to protect scheduled cron endpoints. |
| `NEXT_PUBLIC_APP_URL` | Yes in production | Public app origin used for redirects and verification. |
| `E2E_TENANT_EMAIL` | Optional | Tenant account email for Playwright tests. |
| `E2E_TENANT_PASSWORD` | Optional | Tenant account password for Playwright tests. |
| `DEPLOYMENT_TEST_TENANT_EMAIL` | Optional | Tenant account email for production verification. |
| `DEPLOYMENT_TEST_TENANT_PASSWORD` | Optional | Tenant account password for production verification. |

## Project Structure

```text
src/
  app/
    (dashboard)/
      admin/       Admin pages
      tenant/      Tenant pages
      profile/     Shared profile page
    api/           Health and cron endpoints (auth runs client-side via Supabase, not through an API route)
    login/         Authentication screens
  actions/         Server Actions grouped by domain
  components/      Feature and UI components
  hooks/           Shared React hooks
  lib/
    supabase/      Supabase clients and auth helpers
    validations/   Zod schemas
scripts/           Operational scripts
supabase/          RLS policies and production migrations
tests/             Security and E2E tests
docs/              Deployment and public release docs
```

## Supabase Setup

This project assumes the base Supabase tables already exist. For a production or defense/demo environment:

1. Disable public sign-up in Supabase Auth.
2. Apply `supabase/rls-policies.sql`.
3. Apply files in `supabase/migrations/` in filename order.
4. Keep `room-images` public.
5. Keep `tenants` and `payment-proofs` private.
6. Limit uploaded image files to JPEG, PNG, or WebP and 5 MB.
7. Set the Site URL and redirect allowlist for your deployed domain.

See `supabase/README.md` and `docs/DEPLOYMENT.md` for the full order.

## Deployment

The app can be deployed to Vercel or any Node-capable host.

Before public traffic:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Then complete the external checklist in `docs/DEPLOYMENT.md`:

- Supabase backup
- RLS and migration applied
- Auth redirects configured
- Storage bucket privacy checked
- Environment variables added to the host
- Health endpoint checked
- Monitoring and rollback plan ready

For a public GitHub repository, also review `docs/PUBLIC_REPO_CHECKLIST.md`.

## Public Repository Safety

Commit source code, SQL policies, migrations, docs, `.env.example`, and CI config.

Do not commit:

- `.env.local` or any real environment file
- Supabase service-role key
- Real tenant data
- Database dumps that contain table data
- Uploaded tenant documents or payment proof images
- Screenshots that reveal private emails, phone numbers, IDs, or keys

If a secret was ever committed or shared publicly, rotate it in Supabase immediately.

## License

No public license has been added yet. Until a license is chosen, this project is source-available only and all rights are reserved.
