import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Simple email-allowlist admin gate — enough for a solo/small-team project.
// Set ADMIN_EMAILS as a comma-separated list in your environment.
// Swap for a `role` column on `profiles` if you ever need more than one
// tier of access or a self-service invite flow.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Call at the top of every admin Server Component and Server Action.
 * Redirects non-admins to login rather than rendering/mutating anything —
 * this is the actual access control, not just UI hiding. The `/admin`
 * routes have no other protection, so don't skip this on a new route.
 */
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    redirect("/login?next=/admin");
  }

  return user!;
}
