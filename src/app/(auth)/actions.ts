"use server";

import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site";
import { redirect } from "next/navigation";

export type AuthState = { error: string | null };

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/catalog");

  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect(next);
}

export async function signup(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();

  if (!email || !password) return { error: "Enter your email and password." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/catalog`,
    },
  });
  if (error) return { error: error.message };

  redirect("/login?confirm=1");
}
