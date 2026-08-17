# RRMS — Project Status & Cleanup Notes

An honest internal audit of the codebase: what's fully built, what was duplicated and has now been cleaned up, and what's intentionally left out. Read this before a demo or a code walkthrough so you have a straight answer ready for any "why does it have X" question.

Last reviewed: 2026-08-17.

---

## 1. Feature inventory — what's actually built

Every bullet below was verified against the real routes and Server Actions, not just claimed.

**Admin portal** (`/admin/*`)

| Feature | Status |
| --- | --- |
| Dashboard (revenue, occupancy, bills, payments, maintenance summary + charts) | ✅ Working |
| Room management (CRUD, images, pricing, floor, status) | ✅ Working |
| Tenant management (CRUD, contact info, private ID document storage) | ✅ Working |
| Contract management (create/renew/end, status tracking) | ✅ Working |
| Monthly bill generation (rent + water/electric from meter readings) | ✅ Working |
| Payment tracking (proof upload, approve/reject, history) | ✅ Working |
| Maintenance request tracking (view, update status) | ✅ Working |
| Reports (revenue/occupancy/status charts) | ✅ Working |
| **Report export** | ✅ Working — exports **CSV**, not native `.xlsx`. It opens fine in Excel, but say "CSV export" if asked, not "Excel export" (the README used to overstate this — now fixed). |
| Settings (payment QR code, billing defaults) | ✅ Working |

**Tenant portal** (`/tenant/*`)

| Feature | Status |
| --- | --- |
| Dashboard (room, contract, current bill summary) | ✅ Working |
| Bill list + current bill breakdown | ✅ Working |
| Payment submission (QR + proof upload) | ✅ Working |
| Payment history | ✅ Working |
| Contract details + progress | ✅ Working |
| Maintenance request submission + tracking | ✅ Working |
| Tenant self-service settings | ❌ Not built (see §3) |

**Security/ops**

Route protection, server-side role re-checks, Postgres RLS, Zod validation on every mutation, file-upload type/size checks, health check endpoint, scheduled status sync — all present and covered by `tests/security.test.mjs`.

---

## 2. Duplication found and removed

This was the main ask: find anything that looks copy-pasted so you're not caught off guard if someone reviewing the code asks about it. Everything in this section was **fixed in this pass**, not just written down.

### Routes — clean, nothing to fix

Every sidebar link maps to exactly one page, and every admin/tenant page has exactly one sidebar entry. No two routes serve the same purpose. (One thing found and removed: an empty, page-less `tenant/settings/` folder — leftover scaffolding for a feature that was never built. It had no `page.tsx`, so it was never a working link anyone could click; it's deleted now.)

### Code — real duplication, now consolidated

Before this pass, the same three UI patterns were copy-pasted independently in most feature files:

| Pattern | Was duplicated in | Now lives in |
| --- | --- | --- |
| Stat/metric card (title + value + icon + colored accent bar) | 11 separate local copies across every admin table, the admin dashboard, and every tenant page | `src/components/ui/stat-card.tsx` |
| Status/priority pill (colored dot + label) | 11 separate local copies across every table and every tenant page | `src/components/ui/badge.tsx` |
| "Format a bill's month as YYYY-MM" helper | 3 identical copies across tenant pages | `formatBillingMonth()` in `src/lib/utils.ts` |

Each file still keeps its **own** status → color/label mapping (e.g. what "paid" means for a bill vs. what "active" means for a contract) — that part is genuinely domain-specific and correctly stays local. What was duplicated was the *presentation shell* (the actual card/pill markup and CSS), which now renders through one shared component everywhere. If someone opens the code and asks "why is StatCard defined in 8 places," the honest answer is now "it isn't — it's one component, imported everywhere."

Visual output is unchanged — every page was screenshotted in light and dark mode before and after, and behaves identically (including the two special cases: the room-status badge's fixed width, and the contract-status badge's extra icon for colorblind/print accessibility).

### Dead code — removed

- **`src/components/shared/ui.tsx`** — an entire unused component file (`StatusBadge`, `Card`, `SectionCard`, `Toast`, and others) that was never imported anywhere. It looks like an earlier, abandoned attempt at exactly the consolidation done in this pass. Deleted.
- **`src/actions/staff.ts`** — a `getStaffAction` function with no callers anywhere in the app (a "staff management" feature that was started and never wired up). Deleted.

### Small inconsistencies fixed

- **Payment-proof file validation drift**: the admin upload path accepted the (rare but real) `image/jpg` MIME type; the tenant upload path didn't, so the exact same photo could be accepted from the admin side and rejected from the tenant side. Both now accept the same set (`jpeg`, `jpg`, `png`, `webp`).
- **README accuracy**: it previously said "Reports with Excel export" (the export is actually CSV) and listed `api/auth` as an existing endpoint (there isn't one — Supabase auth runs client-side, not through a Next.js API route). Both corrected.

### Reviewed and judged intentional — no change made

- **Contract/bill status labels differ slightly between the compact table badge and the admin edit-form dropdown** (e.g. badge says "សកម្ម", the form's dropdown says "សកម្ម (Active)"). This isn't accidental drift — the form intentionally adds the English word as a data-entry hint, the badge is deliberately compact. If asked, this is a UX choice, not a bug.
- **Admin vs. tenant Server Actions** (`actions/bills.ts` vs `actions/tenants/bills.ts`, and the same split for payments/maintenance) were checked line by line. These are genuinely different — different auth guards (`requireAdmin` vs `requireTenant`), different allowed operations (tenants can't approve their own payments, can't delete bills, etc.), different data scope. This is the intentional architecture documented in `CLAUDE.md`, not copy-paste padding.
- **The payment-QR panel appears on both the tenant Bills page and the tenant Payments page.** They're similar but not identical (different image sizing, the Bills page adds a "I've paid" CTA the Payments page doesn't need). This is a deliberate UX choice — showing the QR code in both places removes a click for the tenant — not a bug to fix.

---

## 3. What's intentionally missing (not a gap, just be ready to explain it)

- **No self-service "forgot password" flow.** Password resets are done by the admin/operator via a CLI script (`scripts/reset-admin-password.ts`) that requires the Supabase service-role key. This is a deliberate scope decision for the current version, not an oversight — say so directly if asked, rather than implying it's coming "soon" unless you actually plan to build it.
- **No tenant-facing settings page.** Tenants have no profile/preferences page of their own beyond the shared `/profile` view. The nav placeholder for it was removed along with the empty folder (see §2).
- **No staff/multi-admin management UI.** Only a single implicit "admin" role exists; there's no way to invite a second admin user or assign granular permissions from the UI. (The dead `getStaffAction` mentioned above was a first step toward this that was abandoned — worth knowing if a client specifically asks for multi-admin support, since there's no working foundation for it yet despite that file's existence.)

## 4. Test coverage — what's actually verified automatically

Being precise here matters if a technical reviewer asks "is this tested":

- `tests/security.test.mjs` (6 checks) verifies the authorization *design* is in place — it reads the RLS policy SQL, the migration SQL, and specific source files as text and checks that the right patterns exist (e.g. private storage buckets, `server-only` boundaries, CSP headers). It does **not** make real database or HTTP calls.
- `tests/e2e/auth-flow.spec.ts` (2 Playwright tests) verifies: an unauthenticated visitor is redirected to login, and a tenant can't land on an admin page. That's the full extent of end-to-end coverage.
- **Not covered by any automated test**: the payment submit → approve/reject lifecycle, contract creation/renewal, monthly bill generation, the maintenance request lifecycle, room/tenant CRUD, and a successful admin login. These all work (verified manually via browser testing throughout development), but there's no regression test that would catch a future break in these flows automatically.

If a technical buyer asks about test coverage, this is the honest picture: security boundaries are enforced and checked, but day-to-day business-flow regressions currently rely on manual testing, not CI.
