import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

const fallbackUrl = "https://placeholder-project.supabase.co";
const fallbackAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

// One client instance is enough per browser tab; call this inside components/hooks.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackAnonKey;

  return createBrowserClient<Database>(url, anonKey);
}
