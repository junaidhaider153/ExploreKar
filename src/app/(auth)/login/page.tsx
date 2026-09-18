"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, type AuthState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-ink px-6 py-3 font-display text-sm text-flash hover:bg-moss disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState<AuthState, FormData>(login, { error: null });
  const params = useSearchParams();
  const justSignedUp = params.get("confirm") === "1";

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-ink/70">
        New here? <Link href="/signup" className="underline underline-offset-4">Create an account</Link>
      </p>

      {justSignedUp && (
        <p className="mt-6 border border-line bg-flash p-3 text-sm text-moss">
          Check your email to confirm your account, then sign in.
        </p>
      )}

      <form action={formAction} className="mt-8 space-y-4" noValidate>
        <input type="hidden" name="next" value={params.get("next") || "/catalog"} />
        <div>
          <label htmlFor="email" className="block text-sm text-ink/70">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full border border-line bg-flash px-3 py-2 text-ink focus-visible:border-brass"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-ink/70">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full border border-line bg-flash px-3 py-2 text-ink focus-visible:border-brass"
          />
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-red-700">{state.error}</p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
