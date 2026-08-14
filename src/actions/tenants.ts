"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tenantSchema, type Tenant } from "@/lib/validations/tenants";

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function attachSignedIdCard(
  supabase: ReturnType<typeof createAdminClient>,
  tenant: Tenant,
) {
  const paths = tenant.id_card_images ?? [];
  const signedUrls = await Promise.all(
    paths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from("tenants")
        .createSignedUrl(path, 60 * 60);

      return error ? null : data.signedUrl;
    }),
  );

  return {
    ...tenant,
    id_card_image_paths: paths,
    id_card_images: signedUrls.filter((url): url is string => Boolean(url)),
  };
}

// This client uses the Supabase SERVICE ROLE key, which bypasses Row Level
// Security entirely — it's required for auth.admin.* (create/update/delete
// a user's login) and to list every tenant profile regardless of RLS.
// Because RLS can't protect these calls, every exported function below
// must call requireAdmin() first; do not add a new export here without it.
export async function getTenants() {
  await requireAdmin();
  const supabase = createAdminClient();

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

  const tenants = (data || []) as Tenant[];

  // Sign every ID-card path in one Storage API call instead of one call per
  // tenant (attachSignedIdCard() is still used by upsertTenant(), where
  // there's only ever a single tenant, so batching wouldn't help there).
  const allPaths = [...new Set(tenants.flatMap((tenant) => tenant.id_card_images ?? []))];
  const signedUrlMap = new Map<string, string>();

  if (allPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("tenants")
      .createSignedUrls(allPaths, 60 * 60);

    for (const item of signed || []) {
      if (item.path && item.signedUrl) signedUrlMap.set(item.path, item.signedUrl);
    }
  }

  // One batched query for every tenant's active contract (if any) instead
  // of a per-row lookup — the admin list shows the room a tenant is
  // actually renting rather than a status badge that's identical on every
  // row ("អ្នកជួល" for every single tenant, since this list is tenant-only).
  const tenantIds = tenants.map((tenant) => tenant.id);
  const activeRoomByTenant = new Map<string, { roomNumber: string; contractStatus: "active" }>();

  if (tenantIds.length > 0) {
    const { data: activeContracts } = await supabase
      .from("contracts")
      .select("tenant_id, rooms:room_id(room_number)")
      .in("tenant_id", tenantIds)
      .eq("status", "active")
      .is("archived_at", null);

    for (const contract of (activeContracts || []) as unknown as {
      tenant_id: string;
      rooms: { room_number: string } | null;
    }[]) {
      if (contract.rooms?.room_number) {
        activeRoomByTenant.set(contract.tenant_id, {
          roomNumber: contract.rooms.room_number,
          contractStatus: "active",
        });
      }
    }
  }

  return tenants.map((tenant) => {
    const paths = tenant.id_card_images ?? [];
    return {
      ...tenant,
      id_card_image_paths: paths,
      id_card_images: paths
        .map((path) => signedUrlMap.get(path))
        .filter((url): url is string => Boolean(url)),
      activeContract: activeRoomByTenant.get(tenant.id) ?? null,
    };
  });
}

export async function upsertTenant(id: string | null, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

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

  if (!id && password.length < 6) {
    throw new Error("លេខកូដសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ ខ្ទង់");
  }

  const imageFile = formData.get("id_card_image") as File | null;
  let previousImagePath = "";

  if (id) {
    const { data: existingProfile, error: existingProfileError } =
      await supabase
        .from("profiles")
        .select("id_card_images")
        .eq("id", id)
        .single();

    if (existingProfileError) throw new Error(existingProfileError.message);
    previousImagePath = existingProfile.id_card_images?.[0] || "";
  }

  let imagePath = previousImagePath;

  if (imageFile && imageFile.size > 0) {
    const extension = IMAGE_EXTENSIONS[imageFile.type];
    if (!extension) throw new Error("Unsupported image type");

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("tenants")
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error("Upload រូបភាពបរាជ័យ: " + uploadError.message);
    }

    imagePath = fileName;
  }

  if (id) {
    const authUpdate: {
      email: string;
      password?: string;
      user_metadata: {
        full_name: string;
        phone_number: string;
      };
      app_metadata: { role: "tenant" };
    } = {
      email,
      user_metadata: {
        full_name,
        phone_number,
      },
      app_metadata: { role: "tenant" },
    };

    if (password.length >= 6) {
      authUpdate.password = password;
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(
      id,
      authUpdate,
    );

    if (authError) {
      if (imagePath && imagePath !== previousImagePath) {
        await supabase.storage.from("tenants").remove([imagePath]);
      }
      throw new Error(authError.message);
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        role: "tenant",
        full_name,
        email,
        phone_number,
        id_card_images: imagePath ? [imagePath] : [],
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (previousImagePath && previousImagePath !== imagePath) {
      await supabase.storage.from("tenants").remove([previousImagePath]);
    }

    revalidatePath("/admin/tenants");
    return attachSignedIdCard(supabase, data as Tenant);
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
      app_metadata: { role: "tenant" },
    });

  if (authError) {
    if (imagePath) await supabase.storage.from("tenants").remove([imagePath]);
    throw new Error(authError.message);
  }

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
        id_card_images: imagePath ? [imagePath] : [],
      },
    ])
    .select()
    .single();

  if (error) {
    await supabase.auth.admin.deleteUser(userId);
    if (imagePath) await supabase.storage.from("tenants").remove([imagePath]);
    throw new Error(error.message);
  }

  revalidatePath("/admin/tenants");
  return attachSignedIdCard(supabase, data as Tenant);
}

export async function deleteTenant(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();

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

  const imagePaths = profile?.id_card_images || [];

  if (imagePaths.length > 0) {
    await supabase.storage.from("tenants").remove(imagePaths);
  }

  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tenants");
}
