import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const [userId, newPassword] = process.argv.slice(2);

if (!userId || !newPassword) {
  console.error(
    "Usage: npx tsx scripts/reset-admin-password.ts <user-id> <new-password>",
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function resetPassword() {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
    email_confirm: true,
  });

  if (error) {
    console.error(error);
    return;
  }

  console.log("SUCCESS");
  console.log(data.user.email);
}

resetPassword();
