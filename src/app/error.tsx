"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ExploreKar Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full glass-card p-8 rounded-2xl text-center shadow-elevation border border-line">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-terracotta-light text-terracotta flex items-center justify-center">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">
          Something went off-track
        </h2>
        <p className="mt-2 text-sm text-ink-muted leading-relaxed">
          {error.message || "An unexpected error occurred while processing your room request."}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 font-display text-xs font-semibold text-flash hover:bg-moss transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-line bg-flash px-5 py-2.5 font-display text-xs font-semibold text-ink hover:bg-paper-dark transition-colors"
          >
            <Home className="h-3.5 w-3.5 text-ink-muted" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
