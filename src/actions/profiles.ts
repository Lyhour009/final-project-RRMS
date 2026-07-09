"use server";

import { requireUser } from "@/lib/supabase/server";

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

  return data;
}
