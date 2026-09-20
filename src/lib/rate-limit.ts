import { createAdminClient } from "@/lib/supabase/server";

/**
 * DB-backed rate limiting, matching the pattern FikarNot already uses
 * (server/lib/rateLimit.js) rather than an in-memory Map — a Map resets
 * per cold start and isn't shared across concurrent serverless invocations,
 * so it silently stops limiting anything under real load.
 *
 * Logs one row per request to `api_rate_limit_events` and counts how many
 * a given identifier has made within `windowMs`. Fails OPEN on a logging
 * error (a Supabase hiccup shouldn't block a legitimate request) but logs
 * the failure so it's visible in Vercel logs instead of silently masking
 * both the request and the failure.
 */
export async function checkRateLimit({
  identifier,
  action,
  limit,
  windowMs,
}: {
  identifier: string;
  action: string;
  limit: number;
  windowMs: number;
}): Promise<{ allowed: boolean; remaining: number }> {
  const admin = createAdminClient();
  const windowStart = new Date(Date.now() - windowMs).toISOString();

  const { count, error: countError } = await admin
    .from("api_rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("action", action)
    .gte("created_at", windowStart);

  if (countError) {
    console.error("[rate-limit] count query failed, failing open:", countError.message);
    return { allowed: true, remaining: limit };
  }

  const used = count ?? 0;
  if (used >= limit) {
    return { allowed: false, remaining: 0 };
  }

  const { error: insertError } = await admin
    .from("api_rate_limit_events")
    .insert({ identifier, action });
  if (insertError) {
    console.error("[rate-limit] failed to log event:", insertError.message);
  }

  return { allowed: true, remaining: limit - used - 1 };
}

/** Best-effort caller identifier for unauthenticated requests. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
