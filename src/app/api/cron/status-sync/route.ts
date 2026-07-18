import { timingSafeEqual } from "node:crypto";
import { syncBusinessStatuses } from "@/lib/business-status";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || !supplied) return false;

  const expectedBuffer = Buffer.from(secret);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length
    && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return Response.json({ error: "Cron is not configured" }, { status: 503 });
  }
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await syncBusinessStatuses();
    return Response.json({ success: true, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Scheduled status sync failed", error);
    return Response.json({ error: "Status sync failed" }, { status: 500 });
  }
}
