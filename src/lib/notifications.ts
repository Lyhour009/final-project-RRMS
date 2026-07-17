import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type NotificationInput = {
  userId: string;
  type: string;
  message: string;
  link?: string;
};

export async function createNotification({
  userId,
  type,
  message,
  link,
}: NotificationInput) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    message,
    link,
    is_read: false,
  });

  if (error) {
    throw new Error(error.message);
  }
}
