-- Row Level Security policies for the RRMS Supabase project.
--
-- Run this in the Supabase SQL Editor (or `supabase db execute`) against your
-- project. It is idempotent-ish (DROP POLICY IF EXISTS before each CREATE) so
-- it can be re-run safely, but it does NOT create tables — it assumes the
-- schema already exists as used by the app (profiles, rooms, contracts,
-- bills, payments, maintenance_requests, settings, notifications).
--
-- Why this exists: the app enforces admin/tenant access at the Next.js layer
-- (src/proxy.ts + requireAdmin()/requireUser() in src/lib/supabase/server.ts),
-- but most server actions talk to Supabase using the ANON key, not the
-- service role key. Without RLS, anyone holding a valid Supabase session
-- token (any logged-in tenant) could call the Supabase REST/JS API directly
-- — bypassing the Next.js app entirely — and read or write any row in these
-- tables. RLS is what actually enforces access control at the database
-- layer; the app-layer checks are UX + defense-in-depth on top of it.

-- ── Helper: is the current auth session an admin? ─────────────────────────
-- SECURITY DEFINER + a plain SQL body avoids infinite recursion that would
-- happen if a policy on `profiles` queried `profiles` directly through PostgREST.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ── profiles ───────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Legacy policies from early manual setup via the Supabase Studio UI, before
-- this file existed. They used a different naming convention so the drops
-- below (which only ever knew this file's own policy names) never removed
-- them, and "Tenants update own profile" had no `with check`, letting any
-- tenant update their own `role` column straight to 'admin'. Postgres ORs
-- all permissive policies together, so this one alone defeated the correct,
-- stricter profiles_update_admin policy sitting right next to it. Dropping
-- these by their exact (human-readable, non-snake_case) names is what
-- actually closes the hole — re-running the rest of this file without these
-- three lines does nothing, since it never referenced these names.
drop policy if exists "Admins full access to profiles" on public.profiles;
drop policy if exists "Tenants view own profile" on public.profiles;
drop policy if exists "Tenants update own profile" on public.profiles;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- Profile updates are admin-only. A self-update policy would also let a tenant promote their own account.
-- Role changes go through the server-only service-role admin actions in
-- src/actions/tenants.ts, which already bypass RLS by design.)
drop policy if exists "profiles_update_self_or_admin" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Inserts/deletes on profiles happen via the service-role client in
-- src/actions/tenants.ts (auth.admin.createUser/deleteUser cascades), which
-- bypasses RLS entirely — no anon-key insert/delete policy is needed here.

-- ── rooms ──────────────────────────────────────────────────────────────
-- Room listings aren't sensitive; any authenticated user (tenant dashboards
-- join rooms via contracts/bills) can read them. Only admins can write.
alter table public.rooms enable row level security;

-- Legacy duplicate from the same early manual Studio setup as the profiles
-- one above. Redundant (also admin-only), not itself exploitable, but
-- dropped for the same reason: an unlisted policy name can't be kept in
-- sync by editing this file, so it should not exist at all.
drop policy if exists "Admins full access to rooms" on public.rooms;

drop policy if exists "rooms_select_authenticated" on public.rooms;
create policy "rooms_select_authenticated"
  on public.rooms for select
  using (auth.uid() is not null);

drop policy if exists "rooms_write_admin" on public.rooms;
create policy "rooms_write_admin"
  on public.rooms for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── contracts ──────────────────────────────────────────────────────────
alter table public.contracts enable row level security;

-- Same early-Studio-setup legacy duplicates as profiles/rooms above. Both
-- are read-only or admin-only, so not exploitable, but cleaned up so this
-- file is a complete list of what's actually live.
drop policy if exists "Admins full access to contracts" on public.contracts;
drop policy if exists "Tenants view own contracts" on public.contracts;

drop policy if exists "contracts_select_self_or_admin" on public.contracts;
create policy "contracts_select_self_or_admin"
  on public.contracts for select
  using (tenant_id = auth.uid() or public.is_admin());

drop policy if exists "contracts_write_admin" on public.contracts;
create policy "contracts_write_admin"
  on public.contracts for insert
  with check (public.is_admin());

drop policy if exists "contracts_update_admin" on public.contracts;
create policy "contracts_update_admin"
  on public.contracts for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "contracts_delete_admin" on public.contracts;
create policy "contracts_delete_admin"
  on public.contracts for delete
  using (public.is_admin());

-- ── bills ──────────────────────────────────────────────────────────────
alter table public.bills enable row level security;

-- Same early-Studio-setup legacy duplicates as above — both read-only or
-- admin-only, not exploitable, cleaned up for a complete/accurate file.
drop policy if exists "Admins full access to bills" on public.bills;
drop policy if exists "Tenants view own bills" on public.bills;

drop policy if exists "bills_select_self_or_admin" on public.bills;
create policy "bills_select_self_or_admin"
  on public.bills for select
  using (tenant_id = auth.uid() or public.is_admin());

drop policy if exists "bills_write_admin" on public.bills;
create policy "bills_write_admin"
  on public.bills for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── payments ───────────────────────────────────────────────────────────
alter table public.payments enable row level security;

-- Same early-Studio-setup legacy duplicates as above — one admin-only
-- (via a direct profiles EXISTS check instead of is_admin()), one
-- read-only for a tenant's own rows. Neither grants tenant write access
-- (that would have been as serious as the profiles bug), but cleaned up
-- so this file is a complete/accurate list of what's actually live.
drop policy if exists "admin_all_payments" on public.payments;
drop policy if exists "tenant_select_payments" on public.payments;

drop policy if exists "payments_select_self_or_admin" on public.payments;
create policy "payments_select_self_or_admin"
  on public.payments for select
  using (tenant_id = auth.uid() or public.is_admin());

-- Tenants submit their own payment proof (submitTenantPayment / submitPayment).
drop policy if exists "payments_insert_self_or_admin" on public.payments;
create policy "payments_insert_self_or_admin"
  on public.payments for insert
  with check (tenant_id = auth.uid() or public.is_admin());

-- Only admins approve/reject/delete payments.
drop policy if exists "payments_update_admin" on public.payments;
create policy "payments_update_admin"
  on public.payments for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "payments_delete_admin" on public.payments;
create policy "payments_delete_admin"
  on public.payments for delete
  using (public.is_admin());

-- ── maintenance_requests ───────────────────────────────────────────────
alter table public.maintenance_requests enable row level security;

-- Same early-Studio-setup legacy duplicates as above. "Tenants can create
-- maintenance" is scoped to tenant_id = auth.uid(), same restriction as
-- maintenance_insert_self_or_admin below, so not exploitable — cleaned up
-- so this file is a complete/accurate list of what's actually live.
drop policy if exists "Admins full access to maintenance" on public.maintenance_requests;
drop policy if exists "Tenants can create maintenance" on public.maintenance_requests;
drop policy if exists "Tenants view own maintenance" on public.maintenance_requests;

drop policy if exists "maintenance_select_self_or_admin" on public.maintenance_requests;
create policy "maintenance_select_self_or_admin"
  on public.maintenance_requests for select
  using (tenant_id = auth.uid() or public.is_admin());

drop policy if exists "maintenance_insert_self_or_admin" on public.maintenance_requests;
create policy "maintenance_insert_self_or_admin"
  on public.maintenance_requests for insert
  with check (tenant_id = auth.uid() or public.is_admin());

drop policy if exists "maintenance_update_admin" on public.maintenance_requests;
create policy "maintenance_update_admin"
  on public.maintenance_requests for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "maintenance_delete_admin" on public.maintenance_requests;
create policy "maintenance_delete_admin"
  on public.maintenance_requests for delete
  using (public.is_admin());

-- ── settings ───────────────────────────────────────────────────────────
-- Single-row config table: tenants need to read rates/QR/instructions,
-- only admins may write.
alter table public.settings enable row level security;

-- Legacy duplicate from the early Studio setup, with `using (true)` instead
-- of an explicit auth check. settings holds no PII (billing rates, QR image
-- path, payment instructions), so this wasn't a data leak, but a
-- condition-less policy is exactly the shape that turned into a real bug on
-- profiles — dropped so nothing looser than settings_select_authenticated
-- remains.
drop policy if exists "Allow authenticated users to read settings" on public.settings;

drop policy if exists "settings_select_authenticated" on public.settings;
create policy "settings_select_authenticated"
  on public.settings for select
  using (auth.uid() is not null);

drop policy if exists "settings_write_admin" on public.settings;
create policy "settings_write_admin"
  on public.settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── notifications ──────────────────────────────────────────────────────
alter table public.notifications enable row level security;

-- Legacy duplicates from the early Studio setup. "user_select_notifications"
-- and "user_update_notifications" are functionally identical to the real
-- policies below (both scoped to user_id = auth.uid()), so not exploitable.
-- "admin_insert_notifications", though, let any admin's own browser session
-- insert notifications directly via the anon key + JWT — contradicting the
-- deliberate design in src/lib/notifications.ts (no public createNotification
-- Server Action exists specifically so the browser can never fire arbitrary
-- notifications; see CLAUDE.md). Dropped so the comment below is actually
-- true: no insert policy exists at all, service-role only.
drop policy if exists "user_select_notifications" on public.notifications;
drop policy if exists "user_update_notifications" on public.notifications;
drop policy if exists "admin_insert_notifications" on public.notifications;

drop policy if exists "notifications_select_self" on public.notifications;
create policy "notifications_select_self"
  on public.notifications for select
  using (user_id = auth.uid());

-- Notification inserts use the server-only service-role helper.
-- Browser clients receive no insert policy and cannot choose recipients.
--
--
--
drop policy if exists "notifications_insert_authenticated" on public.notifications;

-- Tenants/admins can only mark their own notifications read.
drop policy if exists "notifications_update_self" on public.notifications;
create policy "notifications_update_self"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
