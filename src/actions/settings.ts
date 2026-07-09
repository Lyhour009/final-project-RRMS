"use server";

import { requireAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const QR_BUCKET = "room-images";

export async function getSettings() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}

export async function updateSettings(prevState: unknown, formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") || "");

  if (!id) {
    return { success: false, message: "រកមិនឃើញ Settings ID" };
  }

  const { error } = await supabase
    .from("settings")
    .update({
      water_rate: Number(formData.get("water_rate") || 0),
      electric_rate: Number(formData.get("electric_rate") || 0),
      late_fee: Number(formData.get("late_fee") || 0),
      monthly_due_day: Number(formData.get("monthly_due_day") || 1),
      currency: String(formData.get("currency") || "USD"),
      payment_instruction: String(formData.get("payment_instruction") || ""),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/tenant/payments");

  return {
    success: true,
    message: "ការកំណត់ត្រូវបានរក្សាទុកជោគជ័យ",
  };
}

export async function uploadPaymentQr(prevState: unknown, formData: FormData) {
  const { supabase } = await requireAdmin();

  const qrFile = formData.get("qr_image") as File | null;

  if (!qrFile || qrFile.size === 0) {
    return { success: false, message: "សូមជ្រើសរើស QR Image" };
  }

  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (settingsError || !settings) {
    return { success: false, message: "មិនមាន Settings row ក្នុង Database" };
  }

  const fileName = `payment-qr/${Date.now()}-${qrFile.name.replace(/\s+/g, "_")}`;

  const { error: uploadError } = await supabase.storage
    .from(QR_BUCKET)
    .upload(fileName, qrFile, {
      upsert: false,
    });

  if (uploadError) {
    return { success: false, message: "Upload QR Code បរាជ័យ: " + uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(QR_BUCKET).getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from("settings")
    .update({
      payment_qr_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", settings.id);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/tenant/payments");

  return {
    success: true,
    message: "បាន Upload និងរក្សាទុក QR Code ជោគជ័យ",
    url: publicUrl,
  };
}
