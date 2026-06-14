"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function getSupabase() {
  const cookieStore = await cookies();
  return await createClient(cookieStore);
}

export async function getMyProfile() {
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("សូមចូលប្រើប្រាស់ជាមុនសិន");
  }

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
