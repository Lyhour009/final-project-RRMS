import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 1. Identify routes based on your actual URL layout (ignoring the (dashboard) route group)
  const isAdminRoute = pathname.startsWith("/admin");
  const isTenantRoute = pathname.startsWith("/tenant");
  const isProtectedRoute = isAdminRoute || isTenantRoute;

  // 2. Handle unauthenticated users trying to access protected dashboards
  if (!user && isProtectedRoute) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 3. Handle Role-Based Access Control (RBAC) for logged-in users
  if (user) {
    // Fetch user profile role from your public.profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    // Prevent Tenants from entering Admin Routes
    if (role === "tenant" && isAdminRoute) {
      url.pathname = "/tenant/overview";
      return NextResponse.redirect(url);
    }

    // Prevent Admins from entering Tenant Routes
    if (role === "admin" && isTenantRoute) {
      url.pathname = "/admin/dashboard"; // Change this if your main admin landing page is different (e.g., "/admin")
      return NextResponse.redirect(url);
    }

    // Redirect logged-in users away from the login page if they try to visit it
    if (pathname === "/") {
      url.pathname = role === "admin" ? "/admin/dashboard" : "/tenant/overview";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

// Ensure middleware runs on all pages except static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
