"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";
import { roomSchema } from "@/lib/validations/room";

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

  const amenitiesRaw = String(formData.get("amenities") || "[]");
  let amenitiesInput: unknown;
  try {
    amenitiesInput = JSON.parse(amenitiesRaw);
  } catch {
    throw new Error("បញ្ជីគ្រឿងបរិក្ខារមិនត្រឹមត្រូវ");
  }

  const parsed = roomSchema.safeParse({
    room_number: formData.get("room_number"),
    room_type: formData.get("room_type"),
    base_price: formData.get("base_price"),
    status: formData.get("status"),
    floor: formData.get("floor"),
    max_occupants: formData.get("max_occupants"),
    description: formData.get("description") ?? "",
    amenities: amenitiesInput,
    image: formData.get("image"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "ទិន្នន័យមិនត្រឹមត្រូវ");
  }

  const {
    room_number,
    room_type,
    base_price,
    status,
    floor,
    max_occupants,
    description,
    amenities,
  } = parsed.data;

  if (status === "occupied" && !id) {
    throw new Error("A room becomes occupied only when an active contract is created");
  }

  if (id) {
    const { data: activeContract, error: activeContractError } = await supabase
      .from("contracts")
      .select("id")
      .eq("room_id", id)
      .eq("status", "active")
      .limit(1);

    if (activeContractError) throw new Error(activeContractError.message);
    if (activeContract?.length && status !== "occupied") {
      throw new Error("End or move the active contract before changing this room status");
    }
    if (!activeContract?.length && status === "occupied") {
      throw new Error("A room can be occupied only when it has an active contract");
    }
  }

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
