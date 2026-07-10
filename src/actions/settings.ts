"use server";

import { requireAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { settingsSchema } from "@/lib/validations/settings";

const QR_BUCKET = "room-images";
const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

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

  const parsed = settingsSchema.safeParse({
    water_rate: formData.get("water_rate"),
    electric_rate: formData.get("electric_rate"),
    late_fee: formData.get("late_fee"),
    monthly_due_day: formData.get("monthly_due_day"),
    currency: formData.get("currency") || "USD",
    payment_instruction: formData.get("payment_instruction"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "ទិន្នន័យមិនត្រឹមត្រូវ",
    };
  }

  const { error } = await supabase
    .from("settings")
    .update({
      ...parsed.data,
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

  if (qrFile.size > MAX_FILE_SIZE) {
    return { success: false, message: "រូបភាពត្រូវតែតូចជាង 5MB" };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(qrFile.type)) {
    return {
      success: false,
      message: "គាំទ្រតែប្រភេទ .jpg, .jpeg, .png និង .webp",
    };
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
