"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signup, type AuthState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-ink px-6 py-3 font-display text-sm text-flash hover:bg-moss disabled:opacity-60"
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState<AuthState, FormData>(signup, { error: null });

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl text-ink">Create an account</h1>
      <p className="mt-2 text-sm text-ink/70">
        Already have one? <Link href="/login" className="underline underline-offset-4">Sign in</Link>
      </p>

      <form action={formAction} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="fullName" className="block text-sm text-ink/70">Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            className="mt-1 w-full border border-line bg-flash px-3 py-2 text-ink focus-visible:border-brass"
          />
        </div>
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
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full border border-line bg-flash px-3 py-2 text-ink focus-visible:border-brass"
          />
          <p className="mt-1 text-xs text-ink/50">At least 8 characters.</p>
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-red-700">{state.error}</p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
