"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function getSupabase() {
  const cookieStore = await cookies();
  return await createClient(cookieStore);
}

export async function createNotification({
  userId,
  type,
  message,
  link,
}: {
  userId: string;
  type: string;
  message: string;
  link?: string;
}) {
  const supabase = await getSupabase();

  const { error } = await supabase.from("notifications").insert([
    {
      user_id: userId,
      type,
      message,
      link,
      is_read: false,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getNotifications(userId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  return data || [];
}

export async function markNotificationAsRead(id: string) {
  const supabase = await getSupabase();

  await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", id);
}

export async function getMyNotifications() {
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, message, is_read, created_at, link")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);

  return data || [];
}
