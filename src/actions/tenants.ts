"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

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
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "tenant")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data || [];
}

export async function upsertTenant(id: string | null, formData: FormData) {
  const supabase = getSupabaseAdmin();

  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone_number = String(formData.get("phone_number") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const existingImageUrl = String(formData.get("existing_image_url") || "");

  if (!full_name || !email || !phone_number) {
    throw new Error("សូមបំពេញព័ត៌មានឲ្យបានគ្រប់គ្រាន់");
  }

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
