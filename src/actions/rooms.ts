"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";

export async function getRooms() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("room_number", { ascending: false });

  if (error) throw new Error(error.message);

  return data || [];
}

export async function upsertRoom(id: string | null, formData: FormData) {
  const { supabase } = await requireAdmin();

  const room_number = String(formData.get("room_number") || "").trim();
  const room_type = String(formData.get("room_type") || "").trim();
  const base_price = Number(formData.get("base_price"));
  const status = String(formData.get("status") || "available");
  const floor = Number(formData.get("floor"));
  const max_occupants = Number(formData.get("max_occupants"));
  const description = String(formData.get("description") || "");

  const amenitiesRaw = String(formData.get("amenities") || "[]");
  const amenities = JSON.parse(amenitiesRaw);

  const imageFile = formData.get("image") as File | null;
  const existingImageUrl = String(formData.get("existing_image_url") || "");

  let imageUrl = existingImageUrl;

  if (imageFile && imageFile.size > 0) {
    const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "_")}`;

    const { error: uploadError } = await supabase.storage
      .from("room-images")
      .upload(fileName, imageFile, {
        upsert: false,
      });

    if (uploadError) {
      throw new Error("Upload រូបភាពបរាជ័យ: " + uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("room-images").getPublicUrl(fileName);

    imageUrl = publicUrl;
  }

  const roomData = {
    room_number,
    room_type,
    base_price,
    status,
    floor,
    max_occupants,
    description,
    amenities,
    images: imageUrl ? [imageUrl] : [],
  };

  if (id) {
    const { data, error } = await supabase
      .from("rooms")
      .update(roomData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/rooms");
    return data;
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert([roomData])
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/admin/rooms");
  return data;
}

export async function deleteRoom(id: string) {
  const { supabase } = await requireAdmin();

  const { data: contracts, error: contractError } = await supabase
    .from("contracts")
    .select("id")
    .eq("room_id", id)
    .limit(1);

  if (contractError) throw new Error(contractError.message);

  if (contracts && contracts.length > 0) {
    throw new Error("មិនអាចលុបបន្ទប់នេះបានទេ ព្រោះមានកិច្ចសន្យាពាក់ព័ន្ធ");
  }

  const { error } = await supabase.from("rooms").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/rooms");
}
