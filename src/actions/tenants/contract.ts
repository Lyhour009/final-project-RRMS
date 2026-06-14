"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function getSupabase() {
  const cookieStore = await cookies();
  return await createClient(cookieStore);
}

export async function getTenantContract() {
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("សូមចូលប្រើប្រាស់ជាមុនសិន");

  const { data, error } = await supabase
    .from("contracts")
    .select(
      `
      id,
      start_date,
      end_date,
      deposit_amount,
      status,
      due_day,
      created_at,
      rooms:room_id (
        id,
        room_number,
        room_type,
        base_price,
        floor,
        status,
        description,
        amenities,
        images
      )
    `,
    )
    .eq("tenant_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}
