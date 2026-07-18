import { NextResponse } from "next/server";
import { createActionClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") || "/";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_recovery_code", requestUrl.origin));
  }

  const supabase = await createActionClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=invalid_recovery_link", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
