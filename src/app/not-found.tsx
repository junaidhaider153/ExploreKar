import Link from "next/link";
import { Camera, Compass, Grid, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center">
        {/* Viewfinder 404 Motif */}
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-2xl border border-line bg-flash shadow-elevation">
          <span className="absolute -top-2 -left-2 h-5 w-5 border-t-2 border-l-2 border-brass" />
          <span className="absolute -top-2 -right-2 h-5 w-5 border-t-2 border-r-2 border-brass" />
          <span className="absolute -bottom-2 -left-2 h-5 w-5 border-b-2 border-l-2 border-brass" />
          <span className="absolute -bottom-2 -right-2 h-5 w-5 border-b-2 border-r-2 border-brass" />
          <span className="font-display text-4xl font-extrabold tracking-tight text-ink">
            404
          </span>
        </div>

        <h1 className="mt-8 font-display text-3xl font-bold tracking-tight text-ink">
          Room or page not found
        </h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-sm mx-auto">
          The space you are looking for might have been moved, renamed, or doesn&apos;t exist.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/catalog"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-display text-xs font-semibold text-flash hover:bg-moss transition-colors shadow-sm"
          >
            <Grid className="h-4 w-4 text-brass" />
            Explore Catalog
          </Link>
          <Link
            href="/room"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-line bg-flash px-6 py-3 font-display text-xs font-semibold text-ink hover:bg-paper-dark transition-colors"
          >
            <Camera className="h-4 w-4 text-moss" />
            AI Visualizer
          </Link>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
