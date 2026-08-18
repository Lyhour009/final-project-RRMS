-- Fixes decide_payment(): the 'rejected' branch set paid_at = null, but
-- payments.paid_at is NOT NULL (defaults to now() at insert time), so every
-- rejection failed with "null value in column \"paid_at\" violates
-- not-null constraint" and no payment could ever be rejected. paid_at is a
-- meaningless placeholder until a payment is approved (see the comment in
-- actions/payments.ts submitPayment()), so the rejected branch should just
-- leave it untouched rather than null it out.
begin;

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
    set status = 'rejected', reviewed_at = reviewed_time,
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

commit;
