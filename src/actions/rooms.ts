"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { roomSchema, type RoomFormValues } from "@/types/room";

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getSupabase() {
  const cookiesStore = await cookies();
  return await createClient(cookiesStore);
}

// ─── Map RoomFormValues → DB row ──────────────────────────────────────────────

function toDbPayload(data: RoomFormValues) {
  return {
    room_number: data.roomNumber.trim(),
    room_type: data.roomType.trim(),
    base_price: parseFloat(data.basePrice),
    status: data.status,
    floor: data.floor ? parseInt(data.floor) : null,
    max_occupants: data.maxOccupants ? parseInt(data.maxOccupants) : null,
    description: data.description?.trim() || null,
    amenities:
      data.amenities && data.amenities.length > 0 ? data.amenities : null,
  };
}

// ─── Validate with Zod (shared logic) ────────────────────────────────────────

function validatePayload(payload: RoomFormValues) {
  const result = roomSchema.safeParse(payload);
  if (!result.success) {
    // Collect all field-level messages into a single readable string
    const messages = result.error.issues.map((e) => e.message).join(" ");
    return { ok: false as const, error: messages };
  }
  return { ok: true as const, data: result.data };
}

// ── 1. ទាញយក Rooms ទាំងអស់ ───────────────────────────────────────────────────

export async function getRoomsAction() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return { success: false, data: [], error: error.message };
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: [], error: msg };
  }
}

// ── 2. ទាញយក Room តែមួយ ──────────────────────────────────────────────────────

export async function getRoomByIdAction(id: string) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return { success: false, data: null, error: error.message };
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: null, error: msg };
  }
}

// ── 3. បង្កើត Room ────────────────────────────────────────────────────────────

export async function createRoomAction(payload: RoomFormValues) {
  try {
    const validation = validatePayload(payload);
    if (!validation.ok) {
      return { success: false, error: validation.error };
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("rooms")
      .insert(toDbPayload(validation.data))
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/rooms");
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 4. កែប្រែ Room ────────────────────────────────────────────────────────────

export async function updateRoomAction(id: string, payload: RoomFormValues) {
  try {
    const validation = validatePayload(payload);
    if (!validation.ok) {
      return { success: false, error: validation.error };
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("rooms")
      .update(toDbPayload(validation.data))
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/rooms");
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 5. Upload រូបភាព Room ─────────────────────────────────────────────────────

export async function uploadRoomImagesAction(roomId: string, files: FormData) {
  try {
    const supabase = await getSupabase();
    const uploadedUrls: string[] = [];

    for (const [, file] of files.entries()) {
      if (!(file instanceof File)) continue;

      const ext = file.name.split(".").pop();
      const path = `${roomId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("rooms")
        .upload(path, file, { upsert: false });

      if (uploadError) return { success: false, error: uploadError.message };

      const { data: urlData } = supabase.storage
        .from("rooms")
        .getPublicUrl(path);

      uploadedUrls.push(urlData.publicUrl);
    }

    // Append new URLs to existing images array
    const { data: room } = await supabase
      .from("rooms")
      .select("images")
      .eq("id", roomId)
      .single();

    const existing: string[] = Array.isArray(room?.images) ? room.images : [];
    const merged = [...existing, ...uploadedUrls];

    const { error: updateError } = await supabase
      .from("rooms")
      .update({ images: merged })
      .eq("id", roomId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath("/admin/rooms");
    return { success: true, urls: merged };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 5b. លុបរូបភាព Room តែមួយ ─────────────────────────────────────────────────

export async function deleteRoomImageAction(roomId: string, url: string) {
  try {
    const supabase = await getSupabase();

    // Extract storage path from public URL
    const path = url.split("/rooms/").pop();
    if (!path) return { success: false, error: "Invalid URL" };

    const { error: removeError } = await supabase.storage
      .from("rooms")
      .remove([path]);

    if (removeError) return { success: false, error: removeError.message };

    const { data: room } = await supabase
      .from("rooms")
      .select("images")
      .eq("id", roomId)
      .single();

    const updated = (room?.images ?? []).filter((u: string) => u !== url);

    const { error: updateError } = await supabase
      .from("rooms")
      .update({ images: updated.length > 0 ? updated : null })
      .eq("id", roomId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath("/admin/rooms");
    return { success: true, urls: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 6. លុប Room ───────────────────────────────────────────────────────────────

export async function deleteRoomAction(id: string) {
  try {
    const supabase = await getSupabase();

    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/rooms");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}
