"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import { paymentSchema } from "@/lib/validations/payments";
import { createAdminClient } from "@/lib/supabase/admin";

const PAYMENT_PROOF_BUCKET = "payment-proofs";
const MAX_PROOF_SIZE = 5_000_000;
const PROOF_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function getSignedProofUrl(path?: string | null) {
  if (!path) return null;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.storage
    .from(PAYMENT_PROOF_BUCKET)
    .createSignedUrl(path, 60 * 60);

  return error ? null : data.signedUrl;
}

// Signs every proof path in one Storage API call instead of one call per
// row — getPayments() can list up to 500 rows, and N sequential/concurrent
// createSignedUrl() round trips was the slowest part of loading that page.
async function getSignedProofUrlMap(paths: (string | null | undefined)[]) {
  const uniquePaths = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  const map = new Map<string, string>();
  if (uniquePaths.length === 0) return map;

  const adminClient = createAdminClient();
  const { data } = await adminClient.storage
    .from(PAYMENT_PROOF_BUCKET)
    .createSignedUrls(uniquePaths, 60 * 60);

  for (const item of data || []) {
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
  }

  return map;
}

// See bill-generator.ts for why this cast exists: no generated DB types,
// so Supabase-js can't tell these FK joins resolve to a single row.
type UnpaidBill = {
  id: string;
  contract_id: string;
  tenant_id: string;
  billing_month: string;
  total_amount: number;
  status: string;
  profiles?: {
    id: string;
    full_name: string;
    phone_number: string;
    email?: string;
  };
  contracts?: {
    id: string;
    rooms?: {
      id: string;
      room_number: string;
      room_type: string;
    };
  };
};

export async function getPayments() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      *,
      profiles:tenant_id (
        id,
        full_name,
        phone_number,
        email
      ),
      bills:bill_id (
        id,
        billing_month,
        total_amount,
        status,
        contracts:contract_id (
          id,
          rooms:room_id (
            id,
            room_number,
            room_type
          )
        )
      )
    `,
    )
    // Safety cap: admin list view shows the 500 most recent payments. A
    // payment older than that won't appear here or in search — revisit
    // with real pagination if this becomes a problem.
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);

  const rows = data || [];
  const signedUrls = await getSignedProofUrlMap(rows.map((payment) => payment.proof_image));

  return rows.map((payment) => ({
    ...payment,
    proof_image: payment.proof_image ? signedUrls.get(payment.proof_image) ?? null : null,
  }));
}

export async function getUnpaidBillsForPayment() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("bills")
    .select(
      `
      id,
      contract_id,
      tenant_id,
      billing_month,
      total_amount,
      status,
      profiles:tenant_id (
        id,
        full_name,
        phone_number,
        email
      ),
      contracts:contract_id (
        id,
        rooms:room_id (
          id,
          room_number,
          room_type
        )
      )
    `,
    )
    .in("status", ["unpaid", "overdue"])
    // Naturally bounded by unpaid/overdue status, but capped for
    // defense-in-depth — see getPayments() above for the same pattern.
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);

  return (data || []) as unknown as UnpaidBill[];
}

export async function submitPayment(formData: FormData) {
  const { supabase } = await requireAdmin();

  const parsed = paymentSchema.safeParse({
    bill_id: formData.get("bill_id"),
    amount: formData.get("amount"),
    payment_method: formData.get("payment_method"),
    note: formData.get("note") ?? "",
    proof_image: formData.get("proof_image"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "ទិន្នន័យមិនត្រឹមត្រូវ");
  }

  const { bill_id, amount, payment_method, note } = parsed.data;
  const proofFile = formData.get("proof_image") as File | null;

  // Both reads only need bill_id, neither depends on the other's result.
  const [{ data: bill, error: billError }, { data: existingPending }] =
    await Promise.all([
      supabase
        .from("bills")
        .select("id, tenant_id, total_amount, status")
        .eq("id", bill_id)
        .single(),
      supabase
        .from("payments")
        .select("id")
        .eq("bill_id", bill_id)
        .eq("status", "pending")
        .maybeSingle(),
    ]);

  if (billError || !bill) {
    throw new Error("រកមិនឃើញវិក្កយបត្រនេះទេ");
  }

  if (bill.status === "paid") {
    throw new Error("វិក្កយបត្រនេះបានបង់រួចហើយ");
  }

  if (Math.abs(amount - Number(bill.total_amount)) > 0.005) {
    throw new Error("Payment amount must equal the bill total");
  }

  if (amount > Number(bill.total_amount)) {
    throw new Error("ចំនួនបង់មិនអាចលើសចំនួនសរុបវិក្កយបត្របានទេ");
  }

  if (existingPending) {
    throw new Error("វិក្កយបត្រនេះមានការទូទាត់កំពុងរង់ចាំរួចហើយ");
  }

  let proofImageUrl: string | null = null;

  if (proofFile && proofFile.size > 0) {
    if (proofFile.size > MAX_PROOF_SIZE) {
      throw new Error("Payment proof must be smaller than 5MB");
    }
    const extension = PROOF_EXTENSIONS[proofFile.type];
    if (!extension) throw new Error("Unsupported image type");

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const adminClient = createAdminClient();
    const { error: uploadError } = await adminClient.storage
      .from(PAYMENT_PROOF_BUCKET)
      .upload(fileName, proofFile, {
        contentType: proofFile.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error("Upload រូបភាពបរាជ័យ: " + uploadError.message);
    }

    proofImageUrl = fileName;
  }

  const { data, error } = await supabase
    .from("payments")
    .insert([
      {
        bill_id,
        tenant_id: bill.tenant_id,
        amount,
        payment_method,
        note,
        proof_image: proofImageUrl,
        status: "pending",
        // Not set here: the `payments` table's paid_at column is NOT NULL
        // with a default of now(), so passing null explicitly (instead of
        // omitting the key) overrides that default and violates the
        // constraint. decide_payment() overwrites it again on approval
        // anyway, so the submission-time default is only ever a placeholder.
      },
    ])
    .select(
      `
      *,
      profiles:tenant_id (
        id,
        full_name,
        phone_number,
        email
      ),
      bills:bill_id (
        id,
        billing_month,
        total_amount,
        status,
        contracts:contract_id (
          id,
          rooms:room_id (
            id,
            room_number,
            room_type
          )
        )
      )
    `,
    )
    .single();

  if (error) {
    if (proofImageUrl) {
      const adminClient = createAdminClient();
      await adminClient.storage
        .from(PAYMENT_PROOF_BUCKET)
        .remove([proofImageUrl]);
    }
    throw new Error(error.message);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/billing");
  revalidatePath("/admin/dashboard");
  revalidatePath("/tenant/payments");
  revalidatePath("/tenant/bills");
  revalidatePath("/tenant/dashboard");

  return {
    ...data,
    proof_image: await getSignedProofUrl(data.proof_image),
  };
}

export async function approvePayment(id: string) {
  const { supabase } = await requireAdmin();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id,bill_id,tenant_id,status,amount,bills:bill_id(total_amount,status)")
    .eq("id", id)
    .single();

  if (paymentError || !payment) {
    throw new Error("រកមិនឃើញការទូទាត់នេះទេ");
  }

  if (payment.status !== "pending") {
    throw new Error("ការទូទាត់នេះមិនស្ថិតក្នុងស្ថានភាពរង់ចាំទេ");
  }

  const paymentBill = payment.bills as unknown as {
    total_amount: number;
    status: string;
  } | null;

  if (!paymentBill || !["unpaid", "overdue"].includes(paymentBill.status)) {
    throw new Error("This bill is not payable");
  }

  if (Math.abs(Number(payment.amount) - Number(paymentBill.total_amount)) > 0.005) {
    throw new Error("Payment amount does not match the bill total");
  }

  const { error: updatePaymentError } = await supabase
    .rpc("decide_payment", {
      p_payment_id: id,
      p_decision: "approved",
      p_reason: null,
    });

  if (updatePaymentError) {
    throw new Error(updatePaymentError.message);
  }

  const notifyTenant = () => createNotification({
    userId: payment.tenant_id,
    type: "payment_approved",
    message: "ការទូទាត់របស់អ្នកត្រូវបានអនុម័ត",
    link: "/tenant/payments",
  });

  await notifyTenant();

  revalidatePath("/admin/payments");
  revalidatePath("/admin/billing");
  revalidatePath("/admin/dashboard");
  revalidatePath("/tenant/payments");
  revalidatePath("/tenant/bills");
  revalidatePath("/tenant/dashboard");
}

export async function rejectPayment(id: string, reason: string) {
  const { supabase } = await requireAdmin();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, bill_id, status")
    .eq("id", id)
    .single();

  if (paymentError || !payment) {
    throw new Error("រកមិនឃើញការទូទាត់នេះទេ");
  }

  if (payment.status !== "pending") {
    throw new Error("ការទូទាត់នេះមិនស្ថិតក្នុងស្ថានភាពរង់ចាំទេ");
  }

  const cleanReason = reason.trim().slice(0, 500);
  if (!cleanReason) throw new Error("A rejection reason is required");

  const { error: updatePaymentError } = await supabase
    .rpc("decide_payment", {
      p_payment_id: id,
      p_decision: "rejected",
      p_reason: cleanReason,
    });

  if (updatePaymentError) {
    throw new Error(updatePaymentError.message);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/billing");
  revalidatePath("/admin/dashboard");
}

export async function deletePayment(id: string) {
  const { supabase, user } = await requireAdmin();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, status, proof_image")
    .eq("id", id)
    .is("archived_at", null)
    .single();

  if (paymentError || !payment) {
    throw new Error("រកមិនឃើញការទូទាត់នេះទេ");
  }

  if (payment.status === "approved") {
    throw new Error("មិនអាចលុបការទូទាត់ដែលបានអនុម័តរួចហើយបានទេ");
  }

  const { error } = await supabase
    .from("payments")
    .update({ archived_at: new Date().toISOString(), archived_by: user.id })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/payments");
  revalidatePath("/admin/dashboard");
}
