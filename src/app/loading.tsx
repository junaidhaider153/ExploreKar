import { Camera } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <div className="relative flex flex-col items-center">
        {/* Animated Viewfinder Brackets */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-line bg-flash shadow-elevation">
          <span className="absolute -top-1.5 -left-1.5 h-4 w-4 border-t-2 border-l-2 border-brass animate-pulse" />
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 border-t-2 border-r-2 border-brass animate-pulse" />
          <span className="absolute -bottom-1.5 -left-1.5 h-4 w-4 border-b-2 border-l-2 border-brass animate-pulse" />
          <span className="absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-2 border-r-2 border-brass animate-pulse" />
          <Camera className="h-8 w-8 text-brass animate-bounce" />
        </div>

        <h3 className="mt-6 font-display text-base font-semibold text-ink">
          Calibrating space…
        </h3>
        <p className="mt-1 text-xs text-ink-muted">
          Loading layout & styling parameters
        </p>
      </div>
    </div>
  );
}
