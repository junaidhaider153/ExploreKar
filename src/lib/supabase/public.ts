import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const fallbackUrl = "https://placeholder-project.supabase.co";
const fallbackAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

/**
 * For public, anonymous, cacheable reads only — the product catalog, a
 * product detail page, the sitemap. Deliberately does NOT call cookies()
 * from next/headers.
 *
 * Why this exists: any Server Component that calls cookies() (which
 * `@/lib/supabase/server`'s createClient() does, to read the session) gets
 * opted into fully dynamic rendering for that entire route — silently
 * overriding `export const revalidate = 60` even though nothing about the
 * exported constant changes or errors. Before this split, the catalog page
 * called the cookie-bound client for a query that never even looks at the
 * user, so its `revalidate = 60` was dead code and every request did a full,
 * uncached round trip to Supabase.
 *
 * Rule of thumb: if a Server Component's data doesn't depend on who's
 * logged in, use this client, not `@/lib/supabase/server`'s createClient().
 * The moment a page needs `auth.getUser()` or anything RLS-scoped to the
 * caller, it needs the cookie-bound client instead, and accepts being
 * dynamic as the cost of being personalized.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackAnonKey;

  return createSupabaseJsClient<Database>(url, anonKey, {
    auth: { persistSession: false },
  });
}
