import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 1. Defined createClient first (good practice so it's available above)
export const createClient = (
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) => {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};

// Shared helper so every server action / server component can grab a
// cookie-bound Supabase client in one line instead of repeating
// `cookies()` + `createClient()` boilerplate.
export async function createActionClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

// `auth.getUser()` makes a real round trip to Supabase to revalidate the
// session token against the server (unlike `getSession()`, which only
// decodes the JWT locally) — that revalidation is what makes it safe to
// trust server-side, and every caller below still goes through it. Wrapping
// it in React's cache() only dedupes that round trip *within a single
// request*: the dashboard layout calls getUserProfile() once, and a page
// under it may call requireAdmin() again (sometimes several times over via
// Promise.all'd data-fetchers) — without this, that's the same auth check
// repeated 2-4x for one navigation. cache() is request-scoped, so a
// different request always gets a fresh, real check.
export const getAuthenticatedUser = cache(async () => {
  const supabase = await createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, role: null as string | null };
  }

  // Role must come from the `profiles` table — this is the same source of
  // truth the proxy (src/proxy.ts) uses for route protection, so the UI
  // and the access control never disagree about a user's role.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { supabase, user, role: profile?.role ?? null };
});

// Guards admin-only server actions. Throws (rather than silently returning
// null) so callers don't need their own null-check — the action simply
// fails with a clear message if a non-admin somehow reaches it. This is the
// defense-in-depth layer proxy.ts's route redirect alone can't guarantee:
// a Server Function is a POST endpoint in its own right, and stays exposed
// even if a future refactor moves it off a proxy-protected route.
export async function requireAdmin() {
  const { supabase, user, role } = await getAuthenticatedUser();

  if (!user) {
    throw new Error("សូមចូលប្រើប្រាស់ជាមុនសិន");
  }

  if (role !== "admin") {
    throw new Error("អ្នកមិនមានសិទ្ធិប្រើប្រាស់មុខងារនេះទេ");
  }

  return { supabase, user };
}

export async function getUserProfile() {
  const { user, role } = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  return {
    ...user,
    role: role ?? "tenant",
  };
}

// Guards any tenant-facing server action that needs the signed-in user's id
// (not just admins). Same request-scoped auth check as requireAdmin() —
// see getAuthenticatedUser() above for why this is safe to dedupe.
export async function requireUser() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    throw new Error("សូមចូលប្រើប្រាស់ជាមុនសិន");
  }

  return { supabase, user };
}
