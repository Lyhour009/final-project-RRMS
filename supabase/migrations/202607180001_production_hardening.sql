begin;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Production integrity fields -------------------------------------------------
alter table public.contracts
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid,
  add column if not exists termination_reason text;

alter table public.bills
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid,
  add column if not exists late_fee numeric not null default 0,
  add column if not exists currency text not null default 'USD';

alter table public.payments
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid,
  add column if not exists rejection_reason text;

alter table public.maintenance_requests
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid;

-- Archived operational/financial records stay in the database and audit log,
-- but disappear from normal admin and tenant screens.
drop policy if exists "contracts_select_self_or_admin" on public.contracts;
create policy "contracts_select_self_or_admin" on public.contracts for select
  using (archived_at is null and (tenant_id = auth.uid() or public.is_admin()));

drop policy if exists "bills_select_self_or_admin" on public.bills;
create policy "bills_select_self_or_admin" on public.bills for select
  using (archived_at is null and (tenant_id = auth.uid() or public.is_admin()));

drop policy if exists "payments_select_self_or_admin" on public.payments;
create policy "payments_select_self_or_admin" on public.payments for select
  using (archived_at is null and (tenant_id = auth.uid() or public.is_admin()));

drop policy if exists "maintenance_select_self_or_admin" on public.maintenance_requests;
create policy "maintenance_select_self_or_admin" on public.maintenance_requests for select
  using (archived_at is null and (tenant_id = auth.uid() or public.is_admin()));

-- Concurrency-safe business constraints. The migration intentionally fails if
-- legacy duplicate rows exist, so they can be reviewed instead of silently lost.
create unique index if not exists contracts_one_active_per_room
  on public.contracts (room_id)
  where status = 'active' and archived_at is null;

create unique index if not exists contracts_one_active_per_tenant
  on public.contracts (tenant_id)
  where status = 'active' and archived_at is null;

create unique index if not exists bills_one_per_contract_month
  on public.bills (contract_id, billing_month)
  where archived_at is null;

create unique index if not exists payments_one_pending_per_bill
  on public.payments (bill_id)
  where status = 'pending' and archived_at is null;

-- Immutable audit trail -------------------------------------------------------
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  actor_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_record_lookup
  on public.audit_logs (table_name, record_id, created_at desc);

alter table public.audit_logs enable row level security;
drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin"
  on public.audit_logs for select
  using (public.is_admin());

create or replace function public.capture_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_id uuid;
begin
  row_id := coalesce((to_jsonb(new) ->> 'id')::uuid, (to_jsonb(old) ->> 'id')::uuid);
  insert into public.audit_logs(table_name, record_id, action, actor_id, old_data, new_data)
  values (
    tg_table_name,
    row_id,
    tg_op,
    auth.uid(),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'rooms', 'profiles', 'contracts', 'bills', 'payments',
    'maintenance_requests', 'settings'
  ] loop
    execute format('drop trigger if exists audit_%I on public.%I', target_table, target_table);
    execute format(
      'create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.capture_audit_log()',
      target_table,
      target_table
    );
  end loop;
end $$;

-- One database transaction decides a payment and updates its bill. ------------
create or replace function public.decide_payment(
  p_payment_id uuid,
  p_decision text,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_payment public.payments%rowtype;
  selected_bill public.bills%rowtype;
  reviewed_time timestamptz := now();
begin
  if not public.is_admin() then
    raise exception 'Only administrators can decide payments' using errcode = '42501';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Invalid payment decision' using errcode = '22023';
  end if;

  select * into selected_payment
  from public.payments
  where id = p_payment_id and archived_at is null
  for update;

  if not found then raise exception 'Payment not found'; end if;
  if selected_payment.status <> 'pending' then raise exception 'Payment is not pending'; end if;

  select * into selected_bill
  from public.bills
  where id = selected_payment.bill_id and archived_at is null
  for update;

  if not found then raise exception 'Bill not found'; end if;

  if p_decision = 'approved' then
    if selected_bill.status not in ('unpaid', 'overdue') then
      raise exception 'Bill is not payable';
    end if;
    if abs(selected_payment.amount - selected_bill.total_amount) > 0.005 then
      raise exception 'Payment amount does not match bill total';
    end if;

    update public.payments
    set status = 'approved', paid_at = reviewed_time, reviewed_at = reviewed_time,
        reviewed_by = auth.uid(), rejection_reason = null
    where id = p_payment_id;

    update public.bills
    set status = 'paid', paid_at = reviewed_time
    where id = selected_bill.id;
  else
    if nullif(trim(p_reason), '') is null then
      raise exception 'A rejection reason is required' using errcode = '22023';
    end if;

    update public.payments
    set status = 'rejected', paid_at = null, reviewed_at = reviewed_time,
        reviewed_by = auth.uid(), rejection_reason = left(trim(p_reason), 500)
    where id = p_payment_id;

    -- A rejected proof does not change whether the bill is unpaid or overdue.
    -- Keeping its prior state also preserves an already-applied late fee.
  end if;

  return jsonb_build_object(
    'payment_id', selected_payment.id,
    'bill_id', selected_bill.id,
    'tenant_id', selected_payment.tenant_id,
    'decision', p_decision
  );
end;
$$;

revoke all on function public.decide_payment(uuid, text, text) from public;
grant execute on function public.decide_payment(uuid, text, text) to authenticated;

-- Storage buckets and write policies -----------------------------------------
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('room-images', 'room-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('tenants', 'tenants', false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "room_images_read_public" on storage.objects;
create policy "room_images_read_public" on storage.objects for select
  using (bucket_id = 'room-images');

drop policy if exists "storage_admin_insert" on storage.objects;
create policy "storage_admin_insert" on storage.objects for insert
  with check (bucket_id in ('room-images','tenants','payment-proofs') and public.is_admin());

drop policy if exists "storage_admin_update" on storage.objects;
create policy "storage_admin_update" on storage.objects for update
  using (bucket_id in ('room-images','tenants','payment-proofs') and public.is_admin())
  with check (bucket_id in ('room-images','tenants','payment-proofs') and public.is_admin());

drop policy if exists "storage_admin_delete" on storage.objects;
create policy "storage_admin_delete" on storage.objects for delete
  using (bucket_id in ('room-images','tenants','payment-proofs') and public.is_admin());

commit;
