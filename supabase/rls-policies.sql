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
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ───────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- Tenants may update their own non-role fields; admins may update anyone.
-- (Role changes should go through the service-role admin actions in
-- src/actions/tenants.ts, which already bypass RLS by design.)
drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Inserts/deletes on profiles happen via the service-role client in
-- src/actions/tenants.ts (auth.admin.createUser/deleteUser cascades), which
-- bypasses RLS entirely — no anon-key insert/delete policy is needed here.

-- ── rooms ──────────────────────────────────────────────────────────────
-- Room listings aren't sensitive; any authenticated user (tenant dashboards
-- join rooms via contracts/bills) can read them. Only admins can write.
alter table public.rooms enable row level security;

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

drop policy if exists "notifications_select_self" on public.notifications;
create policy "notifications_select_self"
  on public.notifications for select
  using (user_id = auth.uid());

-- Any authenticated user can create a notification targeting another user
-- (admin -> tenant on bill/payment events, tenant -> admin on new payments/
-- maintenance requests) — src/actions/notifications.ts's createNotification
-- now requires an authenticated caller (requireUser()) as app-layer
-- defense-in-depth on top of this.
drop policy if exists "notifications_insert_authenticated" on public.notifications;
create policy "notifications_insert_authenticated"
  on public.notifications for insert
  with check (auth.uid() is not null);

-- Tenants/admins can only mark their own notifications read.
drop policy if exists "notifications_update_self" on public.notifications;
create policy "notifications_update_self"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
