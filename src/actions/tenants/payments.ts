"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { createNotification } from "@/actions/notifications";

const PAYMENT_METHODS = [
  "cash",
  "aba",
  "acleda",
  "wing",
  "bank_transfer",
  "other",
] as const;

export async function getTenantPaymentsData() {
  const { supabase, user } = await requireUser();

  const tenantId = user.id;

  const { data: unpaidBills, error: billsError } = await supabase
    .from("bills")
    .select("id, billing_month, total_amount, status")
    .eq("tenant_id", tenantId)
    .in("status", ["unpaid", "overdue"])
    .order("created_at", { ascending: false });

  if (billsError) throw new Error(billsError.message);

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select(
      `
      id,
      bill_id,
      amount,
      payment_method,
      status,
      paid_at,
      note,
      proof_image,
      created_at,
      bills:bill_id (
        id,
        billing_month,
        total_amount
      )
    `,
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (paymentsError) throw new Error(paymentsError.message);

  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("payment_qr_url, payment_instruction")
    .limit(1)
    .maybeSingle();

  if (settingsError) throw new Error(settingsError.message);

  return {
    unpaidBills: unpaidBills || [],
    payments: payments || [],
    settings,
  };
}

export async function submitTenantPayment(formData: FormData) {
  const { supabase, user } = await requireUser();

  const tenantId = user.id;

  const billId = String(formData.get("bill_id") || "");
  const paymentMethodRaw = String(formData.get("payment_method") || "aba");
  const note = String(formData.get("note") || "").slice(0, 500);

  if (!billId) throw new Error("សូមជ្រើសរើសវិក្កយបត្រ");

  if (!PAYMENT_METHODS.includes(paymentMethodRaw as (typeof PAYMENT_METHODS)[number])) {
    throw new Error("សូមជ្រើសរើសវិធីបង់ប្រាក់");
  }

  const paymentMethod = paymentMethodRaw as (typeof PAYMENT_METHODS)[number];

  const { data: bill, error: billError } = await supabase
    .from("bills")
    .select("id, tenant_id, total_amount, status")
    .eq("id", billId)
    .eq("tenant_id", tenantId)
    .single();

  if (billError || !bill) {
    throw new Error("រកមិនឃើញវិក្កយបត្រនេះទេ");
  }

  if (bill.status === "paid") {
    throw new Error("វិក្កយបត្រនេះបានបង់រួចហើយ");
  }

  const { data: existingPending } = await supabase
    .from("payments")
    .select("id")
    .eq("bill_id", billId)
    .eq("tenant_id", tenantId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingPending) {
    throw new Error(
      "អ្នកបានបញ្ជាក់ការទូទាត់រួចហើយ។ សូមរង់ចាំ Admin ផ្ទៀងផ្ទាត់។",
    );
  }

  const { error } = await supabase.from("payments").insert([
    {
      bill_id: billId,
      tenant_id: tenantId,
      amount: Number(bill.total_amount || 0),
      payment_method: paymentMethod,
      note,
      status: "pending",
      paid_at: new Date().toISOString(),
    },
  ]);

  if (error) throw new Error(error.message);

  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  await Promise.all(
    (admins || []).map((admin) =>
      createNotification({
        userId: admin.id,
        type: "payment_submitted",
        message: "មានការទូទាត់ថ្មីពីអ្នកជួល",
        link: "/admin/payments",
      }),
    ),
  );

  revalidatePath("/admin/payments");
  revalidatePath("/tenant/payments");
  revalidatePath("/tenant/bills");
  revalidatePath("/tenant/overview");
}
