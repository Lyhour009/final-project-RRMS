import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function resetPassword() {
  const { data, error } = await supabase.auth.admin.updateUserById(
    "2bc3716f-da30-4187-a3d7-6d3c90b1ed9c",
    {
      password: "admin@rrms2026",
      email_confirm: true,
    },
  );

  if (error) {
    console.error(error);
    return;
  }

  console.log("SUCCESS");
  console.log(data.user.email);
}

resetPassword();
