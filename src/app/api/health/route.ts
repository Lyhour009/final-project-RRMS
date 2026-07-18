import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("settings").select("id").limit(1);
    if (error) throw error;

    return Response.json({
      status: "ok",
      database: "reachable",
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { status: "error", database: "unreachable", timestamp: new Date().toISOString() },
      { status: 503 },
    );
  }
}
