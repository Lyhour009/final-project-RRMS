"use server";

import { requireTenant } from "@/lib/supabase/server";
import { syncBusinessStatuses } from "@/lib/business-status";

// See bill-generator.ts (actions folder) for why this cast exists: no
// generated DB types, so Supabase-js can't tell `rooms:room_id` resolves
// to a single row.
type TenantContract = {
  id: string;
  start_date: string;
  end_date: string;
  deposit_amount: number;
  status: string;
  due_day: number;
  created_at: string;
  rooms: {
    id: string;
    room_number: string;
    room_type: string;
    base_price: number;
    floor: number;
    status: string;
    description: string | null;
    amenities: string[] | null;
    images: string[] | null;
  } | null;
};

export async function getTenantContract() {
  const { supabase, user } = await requireTenant();
  await syncBusinessStatuses();

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

  return data as unknown as TenantContract | null;
}
