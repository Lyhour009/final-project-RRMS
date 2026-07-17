"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import { paymentSchema } from "@/lib/validations/payments";
import { createAdminClient } from "@/lib/supabase/admin";

const PAYMENT_PROOF_BUCKET = "payment-proofs";
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

  return Promise.all(
    (data || []).map(async (payment) => ({
      ...payment,
      proof_image: await getSignedProofUrl(payment.proof_image),
    })),
  );
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

  const { data: bill, error: billError } = await supabase
    .from("bills")
    .select("id, tenant_id, total_amount, status")
    .eq("id", bill_id)
    .single();

  if (billError || !bill) {
    throw new Error("រកមិនឃើញវិក្កយបត្រនេះទេ");
  }

  if (bill.status === "paid") {
    throw new Error("វិក្កយបត្រនេះបានបង់រួចហើយ");
  }

  if (amount > Number(bill.total_amount)) {
    throw new Error("ចំនួនបង់មិនអាចលើសចំនួនសរុបវិក្កយបត្របានទេ");
  }

  const { data: existingPending } = await supabase
    .from("payments")
    .select("id")
    .eq("bill_id", bill_id)
    .eq("status", "pending")
    .maybeSingle();

  if (existingPending) {
    throw new Error("វិក្កយបត្រនេះមានការទូទាត់កំពុងរង់ចាំរួចហើយ");
  }

  let proofImageUrl: string | null = null;

  if (proofFile && proofFile.size > 0) {
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
        paid_at: new Date().toISOString(),
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
  revalidatePath("/admin/bills");
  revalidatePath("/tenant/payments");
  revalidatePath("/tenant/bills");

  return {
    ...data,
    proof_image: await getSignedProofUrl(data.proof_image),
  };
}

export async function approvePayment(id: string) {
  const { supabase } = await requireAdmin();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id,bill_id,tenant_id,status")
    .eq("id", id)
    .single();

  if (paymentError || !payment) {
    throw new Error("រកមិនឃើញការទូទាត់នេះទេ");
  }

  if (payment.status !== "pending") {
    throw new Error("ការទូទាត់នេះមិនស្ថិតក្នុងស្ថានភាពរង់ចាំទេ");
  }

  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      status: "approved",
    })
    .eq("id", id);

  if (updatePaymentError) {
    throw new Error(updatePaymentError.message);
  }

  await createNotification({
    userId: payment.tenant_id,
    type: "payment_approved",
    message: "ការទូទាត់របស់អ្នកត្រូវបានអនុម័ត",
    link: "/tenant/payments",
  });

  const { error: updateBillError } = await supabase
    .from("bills")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", payment.bill_id);

  if (updateBillError) {
    throw new Error(updateBillError.message);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/bills");
  revalidatePath("/tenant/payments");
  revalidatePath("/tenant/bills");
}

export async function rejectPayment(id: string) {
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

  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({
      status: "rejected",
    })
    .eq("id", id);

  if (updatePaymentError) {
    throw new Error(updatePaymentError.message);
  }

  await supabase
    .from("bills")
    .update({
      status: "unpaid",
      paid_at: null,
    })
    .eq("id", payment.bill_id);

  revalidatePath("/admin/payments");
  revalidatePath("/admin/bills");
}

export async function deletePayment(id: string) {
  const { supabase } = await requireAdmin();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, status, proof_image")
    .eq("id", id)
    .single();

  if (paymentError || !payment) {
    throw new Error("រកមិនឃើញការទូទាត់នេះទេ");
  }

  if (payment.status === "approved") {
    throw new Error("មិនអាចលុបការទូទាត់ដែលបានអនុម័តរួចហើយបានទេ");
  }

  const { error } = await supabase.from("payments").delete().eq("id", id);

  if (error) throw new Error(error.message);

  if (payment.proof_image) {
    const adminClient = createAdminClient();
    await adminClient.storage
      .from(PAYMENT_PROOF_BUCKET)
      .remove([payment.proof_image]);
  }

  revalidatePath("/admin/payments");
}
