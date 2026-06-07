"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { billFormSchema } from "@/types/bill";
import type { Bill } from "@/types/bill";

async function getSupabase() {
  const cookiesStore = await cookies();
  return await createClient(cookiesStore);
}

const BILL_SELECT = `
  id,
  contract_id,
  tenant_id,
  billing_month,
  water_meter_start,
  water_meter_end,
  elec_meter_start,
  elec_meter_end,
  room_fee,
  water_fee,
  elec_fee,
  total_amount,
  status,
  created_at,
  paid_at,
  contracts (
    id,
    tenant_id,
    room_id,
    rooms ( room_number, room_type, base_price )
  ),
  profiles ( id, full_name, phone_number )
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcTotal(values: {
  roomFee?: string;
  waterFee?: string;
  elecFee?: string;
}): number {
  return (
    (parseFloat(values.roomFee || "0") || 0) +
    (parseFloat(values.waterFee || "0") || 0) +
    (parseFloat(values.elecFee || "0") || 0)
  );
}

function toRow(values: ReturnType<typeof billFormSchema.parse>) {
  return {
    contract_id: values.contractId,
    tenant_id: values.tenantId,
    billing_month: values.billingMonth ? `${values.billingMonth}-01` : null,
    water_meter_start: values.waterMeterStart
      ? parseFloat(values.waterMeterStart)
      : null,
    water_meter_end: values.waterMeterEnd
      ? parseFloat(values.waterMeterEnd)
      : null,
    elec_meter_start: values.elecMeterStart
      ? parseFloat(values.elecMeterStart)
      : null,
    elec_meter_end: values.elecMeterEnd
      ? parseFloat(values.elecMeterEnd)
      : null,
    room_fee: parseFloat(values.roomFee || "0") || 0,
    water_fee: parseFloat(values.waterFee || "0") || 0,
    elec_fee: parseFloat(values.elecFee || "0") || 0,
    total_amount: calcTotal(values),
    status: values.status,
  };
}

// ── 1. ទាញយក Bills ទាំងអស់ ───────────────────────────────────────────────────
export async function getBillsAction() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("bills")
      .select(BILL_SELECT)
      .order("created_at", { ascending: false });

    if (error) return { success: false, data: [], error: error.message };
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: [], error: msg };
  }
}

// ── 2. ទាញយក Bill តែមួយ ──────────────────────────────────────────────────────
export async function getBillByIdAction(id: string) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("bills")
      .select(BILL_SELECT)
      .eq("id", id)
      .single();

    if (error) return { success: false, data: null, error: error.message };
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: null, error: msg };
  }
}

// ── 3. បង្កើត Bill ថ្មី ───────────────────────────────────────────────────────
export async function createBillAction(payload: unknown) {
  const parsed = billFormSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("bills")
      .insert(toRow(parsed.data))
      .select(BILL_SELECT)
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/bills");
    return { success: true, data: data as unknown as Bill };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 4. កែប្រែ Bill ────────────────────────────────────────────────────────────
export async function updateBillAction(id: string, payload: unknown) {
  const parsed = billFormSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("bills")
      .update(toRow(parsed.data))
      .eq("id", id)
      .select(BILL_SELECT)
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/bills");
    return { success: true, data: data as unknown as Bill };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 5. លុប Bill ───────────────────────────────────────────────────────────────
export async function deleteBillAction(id: string) {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase.from("bills").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/bills");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 6. Mark Bill as Paid ──────────────────────────────────────────────────────
export async function markBillPaidAction(id: string) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("bills")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", id)
      .select(BILL_SELECT)
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/bills");
    return { success: true, data: data as unknown as Bill };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 7. ទាញ Active Contracts + Tenants សម្រាប់ Dropdown ───────────────────────
export async function getBillFormOptionsAction() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("contracts")
      .select(
        `
        id,
        tenant_id,
        status,
        rooms ( room_number, room_type, base_price ),
        profiles ( id, full_name, phone_number )
      `,
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) return { success: false, contracts: [], error: error.message };
    return { success: true, contracts: data ?? [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, contracts: [], error: msg };
  }
}
