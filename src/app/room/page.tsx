import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  Home,
  ChevronRight,
  Sparkles,
  SunMedium,
  Maximize,
  ArrowRight,
  Layers,
} from "lucide-react";
import { RoomUploader } from "@/components/RoomUploader";
import { DEMO_ROOMS } from "@/lib/demo-rooms";
import { CURATED_PRODUCTS } from "@/lib/catalog-data";

export const metadata: Metadata = {
  title: "AI Room Visualizer & Spatial Matcher — ExploreKar",
  description:
    "Upload a photo of your living room, bedroom, or office to get bespoke furniture matched to your space and preview pieces on your wall before you buy.",
};

export default function RoomPage({
  searchParams,
}: {
  searchParams: { product?: string };
}) {
  const presetProduct = searchParams.product
    ? CURATED_PRODUCTS.find((p) => p.slug === searchParams.product)
    : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Link href="/" className="hover:text-ink flex items-center gap-1 transition-colors">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-line-dark" />
        <span className="font-semibold text-ink">AI Room Visualizer</span>
      </nav>

      {/* Preset Product Alert (if coming from PDP) */}
      {presetProduct && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-brass/40 bg-brass-light/40 p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-line bg-flash shrink-0">
              <Image
                src={presetProduct.imageUrl}
                alt={presetProduct.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brass">
                Preloaded Piece
              </span>
              <h4 className="font-display text-sm font-bold text-ink">{presetProduct.title}</h4>
            </div>
          </div>
          <span className="text-xs text-ink-muted hidden sm:inline">
            We will preview this item on your uploaded photo
          </span>
        </div>
      )}

      {/* Main Room Upload Hero */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Uploader */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-line bg-flash p-6 sm:p-8 shadow-sm">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brass-light px-3 py-1 text-xs font-semibold text-brass font-display mb-3">
              <Camera className="h-3.5 w-3.5" />
              <span>Spatial Room Capture</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Photograph Your Space
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-muted">
              One clear photo is all it takes. Gemini AI will analyze your architectural style, wall colors, and lighting to match suitable furniture.
            </p>

            <div className="mt-6">
              <RoomUploader presetProductSlug={searchParams.product} />
            </div>
          </div>
        </div>

        {/* Right Column: Tips & Fast-Track Guidance */}
        <div className="lg:col-span-5 space-y-6">
          {/* Photo Guidelines Card */}
          <div className="rounded-3xl border border-line bg-paper-light p-6">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
              Tips for Best AI Accuracy
            </h3>
            <ul className="mt-4 space-y-3.5 text-xs text-ink-soft">
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-lg bg-paper-dark text-ink flex items-center justify-center shrink-0 mt-0.5">
                  <SunMedium className="h-3.5 w-3.5 text-brass" />
                </div>
                <div>
                  <strong className="text-ink">Even Natural Light:</strong> Capture in daytime with curtains open for accurate color palette detection.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-lg bg-paper-dark text-ink flex items-center justify-center shrink-0 mt-0.5">
                  <Maximize className="h-3.5 w-3.5 text-brass" />
                </div>
                <div>
                  <strong className="text-ink">Step Back:</strong> Include the floor and the full width of the wall where you want to place furniture.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-lg bg-paper-dark text-ink flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="h-3.5 w-3.5 text-brass" />
                </div>
                <div>
                  <strong className="text-ink">No Measuring Tape Needed:</strong> Scale and rotate directly on the interactive studio canvas.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Rooms Section */}
      <section className="mt-20 border-t border-line pt-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brass font-display">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Instant Test Drive</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Don&apos;t have a photo ready? Try a Demo Room
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Select one of our pre-scanned interior spaces to experience the visualizer studio immediately.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_ROOMS.map((demo) => (
            <Link
              key={demo.id}
              href={`/room/guest/results?demo=${demo.id}${
                searchParams.product ? `&product=${encodeURIComponent(searchParams.product)}` : ""
              }`}
              className="group relative flex flex-col rounded-2xl border border-line bg-flash p-4 transition-all duration-300 hover:border-brass/40 hover:shadow-elevation"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-paper-light">
                <Image
                  src={demo.photoUrl}
                  alt={demo.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="rounded-full glass-hud px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    {demo.roomType.replace("-", " ")}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-ink group-hover:text-brass transition-colors">
                    {demo.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-muted line-clamp-2 leading-relaxed">
                    {demo.subtitle}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-line/60">
                  <span className="text-xs font-semibold text-brass flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Launch Visualizer</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
