"use server";

import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncBusinessStatuses } from "@/lib/business-status";

const PAYMENT_METHODS = [
  "cash",
  "aba",
  "acleda",
  "wing",
  "bank_transfer",
  "other",
] as const;
const MAX_PROOF_SIZE = 5_000_000;
const PROOF_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function getTenantPaymentsData() {
  const { supabase, user } = await requireTenant();
  await syncBusinessStatuses();

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

  // Sign every proof path in one Storage API call instead of one call per
  // payment row.
  const adminClient = createAdminClient();
  const proofPaths = [
    ...new Set((payments || []).map((payment) => payment.proof_image).filter((path): path is string => Boolean(path))),
  ];
  const signedUrlMap = new Map<string, string>();

  if (proofPaths.length > 0) {
    const { data: signed } = await adminClient.storage
      .from("payment-proofs")
      .createSignedUrls(proofPaths, 60 * 60);

    for (const item of signed || []) {
      if (item.path && item.signedUrl) signedUrlMap.set(item.path, item.signedUrl);
    }
  }

  const paymentsWithSignedProofs = (payments || []).map((payment) => ({
    ...payment,
    proof_image: payment.proof_image ? signedUrlMap.get(payment.proof_image) ?? null : null,
  }));

  return {
    unpaidBills: unpaidBills || [],
    payments: paymentsWithSignedProofs,
    settings,
  };
}

export async function submitTenantPayment(formData: FormData) {
  const { supabase, user } = await requireTenant();

  const tenantId = user.id;

  const billId = String(formData.get("bill_id") || "");
  const paymentMethodRaw = String(formData.get("payment_method") || "aba");
  const note = String(formData.get("note") || "").slice(0, 500);
  const proofFile = formData.get("proof_image") as File | null;

  if (!billId) throw new Error("សូមជ្រើសរើសវិក្កយបត្រ");

  if (!PAYMENT_METHODS.includes(paymentMethodRaw as (typeof PAYMENT_METHODS)[number])) {
    throw new Error("សូមជ្រើសរើសវិធីបង់ប្រាក់");
  }

  const paymentMethod = paymentMethodRaw as (typeof PAYMENT_METHODS)[number];

  if (paymentMethod !== "cash" && (!proofFile || proofFile.size === 0)) {
    throw new Error("Please upload payment proof for an electronic payment");
  }

  if (proofFile && proofFile.size > 0) {
    if (proofFile.size > MAX_PROOF_SIZE) throw new Error("Payment proof must be smaller than 5MB");
    if (!PROOF_EXTENSIONS[proofFile.type]) throw new Error("Payment proof must be JPG, PNG, or WebP");
  }

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

  let proofImagePath: string | null = null;
  const adminClient = createAdminClient();

  if (proofFile && proofFile.size > 0) {
    proofImagePath = `${tenantId}/${crypto.randomUUID()}.${PROOF_EXTENSIONS[proofFile.type]}`;
    const { error: uploadError } = await adminClient.storage
      .from("payment-proofs")
      .upload(proofImagePath, proofFile, {
        contentType: proofFile.type,
        upsert: false,
      });

    if (uploadError) throw new Error(`Payment proof upload failed: ${uploadError.message}`);
  }

  const { error } = await supabase.from("payments").insert([
    {
      bill_id: billId,
      tenant_id: tenantId,
      amount: Number(bill.total_amount || 0),
      payment_method: paymentMethod,
      note,
      proof_image: proofImagePath,
      status: "pending",
      paid_at: null,
    },
  ]);

  if (error) {
    if (proofImagePath) {
      await adminClient.storage.from("payment-proofs").remove([proofImagePath]);
    }
    throw new Error(error.message);
  }

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
  revalidatePath("/tenant/dashboard");
}
