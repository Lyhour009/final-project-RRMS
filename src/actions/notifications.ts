"use server";

import { createActionClient, getAuthenticatedUser } from "@/lib/supabase/server";

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
  const supabase = await createActionClient();

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

export async function markNotificationAsRead(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) return;

  await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", id)
    .eq("user_id", user.id);
}

export async function getMyNotifications() {
  const { supabase, user } = await getAuthenticatedUser();

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
