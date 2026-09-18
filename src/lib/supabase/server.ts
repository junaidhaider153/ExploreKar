import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

const fallbackUrl = "https://placeholder-project.supabase.co";
const fallbackAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

// Use inside Server Components, Route Handlers, and Server Actions.
// Reads the user's session from cookies — respects RLS as that user.
export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackAnonKey;

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component with no request context to mutate —
            // safe to ignore as long as middleware.ts is also refreshing the session.
          }
        },
      },
    },
  );
}

// Admin client that bypasses RLS. Server-only — never import this from a
// Client Component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackAnonKey;

  return createSupabaseJsClient<Database>(
    url,
    serviceKey,
    { auth: { persistSession: false } },
  );
}
