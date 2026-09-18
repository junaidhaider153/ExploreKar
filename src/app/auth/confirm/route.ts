import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

// Supabase's confirmation emails link here with a `token_hash` + `type`.
// Configure this as the "Confirm signup" redirect URL in Supabase Auth settings:
//   {SITE_URL}/auth/confirm
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/catalog";

  if (token_hash && type) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "email" | "recovery" | "invite",
      token_hash,
    });
    if (!error) redirect(next);
  }

  redirect("/login?error=confirmation-failed");
}
