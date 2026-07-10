"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/supabase/server";
import { tenantSchema } from "@/lib/validations/tenants";

// This client uses the Supabase SERVICE ROLE key, which bypasses Row Level
// Security entirely — it's required for auth.admin.* (create/update/delete
// a user's login) and to list every tenant profile regardless of RLS.
// Because RLS can't protect these calls, every exported function below
// must call requireAdmin() first; do not add a new export here without it.
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export async function getTenants() {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  // Safety cap: admin list view shows the 500 most recent tenants. A tenant
  // older than that won't appear here or in search — revisit with real
  // pagination if this becomes a problem.
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "tenant")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);

  return data || [];
}

export async function upsertTenant(id: string | null, formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const parsed = tenantSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone_number: formData.get("phone_number"),
    password: formData.get("password") ?? "",
    id_card_image: formData.get("id_card_image"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "ទិន្នន័យមិនត្រឹមត្រូវ");
  }

  const { full_name, email, phone_number } = parsed.data;
  const password = (parsed.data.password ?? "").trim();
  const existingImageUrl = String(formData.get("existing_image_url") || "");

  if (!id && password.length < 6) {
    throw new Error("លេខកូដសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ ខ្ទង់");
  }

  const imageFile = formData.get("id_card_image") as File | null;
  let imageUrl = existingImageUrl;

  if (imageFile && imageFile.size > 0) {
    const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "_")}`;

    const { error: uploadError } = await supabase.storage
      .from("tenants")
      .upload(fileName, imageFile, {
        upsert: false,
      });

    if (uploadError) {
      throw new Error("Upload រូបភាពបរាជ័យ: " + uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("tenants").getPublicUrl(fileName);

    imageUrl = publicUrl;
  }

  if (id) {
    const authUpdate: {
      email: string;
      password?: string;
      user_metadata: {
        full_name: string;
        phone_number: string;
      };
    } = {
      email,
      user_metadata: {
        full_name,
        phone_number,
      },
    };

    if (password.length >= 6) {
      authUpdate.password = password;
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(
      id,
      authUpdate,
    );

    if (authError) throw new Error(authError.message);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        role: "tenant",
        full_name,
        email,
        phone_number,
        id_card_images: imageUrl ? [imageUrl] : [],
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/admin/tenants");
    return data;
  }

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone_number,
      },
    });

  if (authError) throw new Error(authError.message);

  const userId = authData.user.id;

  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        id: userId,
        role: "tenant",
        full_name,
        email,
        phone_number,
        id_card_images: imageUrl ? [imageUrl] : [],
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tenants");
  return data;
}

export async function deleteTenant(id: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const checkTables = ["contracts", "bills", "maintenance_requests"];

  for (const table of checkTables) {
    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq("tenant_id", id)
      .limit(1);

    if (error) throw new Error(error.message);

    if (data && data.length > 0) {
      throw new Error("មិនអាចលុបអ្នកជួលនេះបានទេ ព្រោះមានទិន្នន័យពាក់ព័ន្ធ");
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id_card_images")
    .eq("id", id)
    .single();

  const imageUrls = profile?.id_card_images || [];

  if (imageUrls.length > 0) {
    const paths = imageUrls
      .map((url: string) => {
        const marker = "/storage/v1/object/public/tenants/";
        const index = url.indexOf(marker);
        return index >= 0 ? url.slice(index + marker.length) : null;
      })
      .filter(Boolean) as string[];

    if (paths.length > 0) {
      await supabase.storage.from("tenants").remove(paths);
    }
  }

  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tenants");
}
