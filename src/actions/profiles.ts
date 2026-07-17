"use server";

import { requireUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getMyProfile() {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, role, full_name, phone_number, email, id_card_images, created_at",
    )
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const paths = data.id_card_images ?? [];
  const adminClient = createAdminClient();
  const signedUrls = await Promise.all(
    paths.map(async (path: string) => {
      const { data: signed, error: signedError } = await adminClient.storage
        .from("tenants")
        .createSignedUrl(path, 60 * 60);

      return signedError ? null : signed.signedUrl;
    }),
  );

  return {
    ...data,
    id_card_images: signedUrls.filter((url): url is string => Boolean(url)),
  };
}
