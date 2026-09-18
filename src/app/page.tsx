import Link from "next/link";
import Image from "next/image";
import { Camera, Sparkles, ArrowRight, ShieldCheck, Truck, Heart, Layers } from "lucide-react";
import { CURATED_PRODUCTS } from "@/lib/catalog-data";
import { DEMO_ROOMS } from "@/lib/demo-rooms";
import { ProductCard } from "@/components/ProductCard";

const HOW_IT_WORKS = [
  {
    n: "01",
    icon: Camera,
    title: "Capture your room",
    body: "Take one photo of the space you're furnishing — no measuring tape, no app permissions beyond your camera.",
    color: "text-brass",
    bg: "bg-brass-light",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "AI reads the room",
    body: "Our Gemini-powered engine identifies room type, existing style, and dominant tones in about five seconds.",
    color: "text-moss",
    bg: "bg-moss-light",
  },
  {
    n: "03",
    icon: Layers,
    title: "Preview before you buy",
    body: "See pieces that actually match, then drag, resize, rotate, and layer them right on your own photo.",
    color: "text-terracotta",
    bg: "bg-terracotta-light",
  },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Handcrafted Quality Guarantee" },
  { icon: Truck, label: "Free Delivery in Major Cities" },
  { icon: Sparkles, label: "AI-Matched Recommendations" },
  { icon: Heart, label: "Saved Looks & Wishlist" },
];

// Featured products — pick 3 highlights from catalog
const FEATURED_PRODUCTS = [
  CURATED_PRODUCTS[0], // Walnut Coffee Table
  CURATED_PRODUCTS[1], // Linen Lounge Chair
  CURATED_PRODUCTS[2], // Brass Arc Floor Lamp
];

export default function HomePage() {
  return (
    <>
      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle dot-field backdrop */}
        <div className="absolute inset-0 dot-field opacity-40 pointer-events-none" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brass/30 bg-brass-light px-4 py-1.5 text-xs font-semibold text-brass font-display">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered Interior Design · Pakistan</span>
            </div>

            <h1 className="mt-5 max-w-lg font-display text-5xl leading-[1.04] tracking-tight text-ink sm:text-6xl">
              See it in your room{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-brass">before</span>
                <span className="absolute -bottom-1 left-0 h-3 w-full rounded-sm bg-brass/15 -z-0" />
              </span>{" "}
              it's in your cart.
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70 sm:text-lg">
              Photograph the space you want to furnish. We match handcrafted
              furniture to your room's existing style — so you're not guessing
              from a catalog thumbnail.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/room"
                id="hero-scan-room-cta"
                className="group flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 font-display text-sm font-bold text-flash hover:bg-moss transition-all duration-300 shadow-elevation"
              >
                <Camera className="h-4 w-4 text-brass transition-transform group-hover:scale-110" />
                <span>Scan Your Room Free</span>
                <ArrowRight className="h-3.5 w-3.5 text-brass/70 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/catalog"
                className="text-sm font-medium text-ink/60 underline underline-offset-4 hover:text-ink transition-colors"
              >
                Browse 12+ curated pieces
              </Link>
            </div>

            {/* Trust micro-badges */}
            <div className="mt-8 flex flex-wrap gap-3">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-paper-light/80 px-3 py-1 text-[11px] font-medium text-ink-muted"
                >
                  <Icon className="h-3 w-3 text-moss" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Demo Rooms Mosaic */}
          <div className="hidden md:grid grid-cols-2 gap-3 max-w-lg ml-auto">
            {DEMO_ROOMS.map((room, i) => (
              <Link
                key={room.id}
                href={`/room/guest/results?demo=${room.id}`}
                className={`group relative overflow-hidden rounded-3xl border border-line bg-paper-light shadow-sm hover:border-brass/50 hover:shadow-elevation transition-all duration-500 ${
                  i === 0 ? "col-span-2 aspect-video" : "aspect-square"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={room.photoUrl}
                  alt={room.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-display text-xs font-bold text-flash/90 capitalize">
                    {room.roomType.replace("-", " ")}
                  </p>
                  <p className="text-[10px] text-flash/60 truncate">{room.subtitle}</p>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="rounded-full bg-brass px-4 py-1.5 font-display text-xs font-bold text-ink shadow-md">
                    Try this room →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-flash">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-widest text-brass">
                How It Works
              </p>
              <h2 className="mt-2 max-w-xs font-display text-3xl font-extrabold tracking-tight text-ink">
                Three steps, one photo.
              </h2>
            </div>
            <Link
              href="/room"
              className="self-start sm:self-auto flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 font-display text-xs font-bold text-ink hover:bg-ink hover:text-flash transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
              Try it now
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.n}
                  className="group relative rounded-3xl border border-line bg-paper-light p-7 transition-all duration-300 hover:border-brass/40 hover:shadow-elevation"
                >
                  {/* Step number badge */}
                  <span className="absolute top-5 right-5 font-mono text-4xl font-black text-ink/5 select-none">
                    {step.n}
                  </span>

                  <div
                    className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${step.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${step.color}`} />
                  </div>

                  <h3 className="font-display text-lg font-bold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    {step.body}
                  </p>

                  {/* Connector arrow (not on last) */}
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 h-7 w-7 items-center justify-center rounded-full border border-line bg-flash text-ink-muted z-10 shadow-sm">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DEMO ROOMS (MOBILE) ─────────────────────────────────────────── */}
      <section className="md:hidden border-t border-line">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-brass mb-6">
            Try a Demo Room
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x snap-mandatory">
            {DEMO_ROOMS.map((room) => (
              <Link
                key={room.id}
                href={`/room/guest/results?demo=${room.id}`}
                className="snap-start group relative flex-shrink-0 w-72 aspect-video overflow-hidden rounded-2xl border border-line shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={room.photoUrl}
                  alt={room.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="font-display text-xs font-bold text-flash capitalize">
                    {room.roomType.replace("-", " ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ───────────────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-widest text-brass">
                Curated Picks
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
                Handcrafted for your space.
              </h2>
              <p className="mt-2 text-sm text-ink-muted max-w-sm">
                Each piece is selected by our design team for build quality, material harmony, and versatility.
              </p>
            </div>
            <Link
              href="/catalog"
              className="whitespace-nowrap text-sm font-semibold text-ink underline underline-offset-4 hover:text-brass transition-colors"
            >
              All 12+ pieces →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURED_PRODUCTS.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  slug: p.slug,
                  title: p.title,
                  price_cents: p.price_cents,
                  currency: p.currency,
                  imageUrl: p.imageUrl,
                  categoryName: p.category.name,
                  width_cm: p.width_cm,
                  height_cm: p.height_cm,
                  depth_cm: p.depth_cm,
                  tags: p.tags,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-14 sm:px-14 text-center shadow-elevation">
            {/* Background pattern */}
            <div className="absolute inset-0 dot-field opacity-10 pointer-events-none" />
            {/* Brass corner accents */}
            <span className="absolute top-5 left-5 h-5 w-5 border-t-2 border-l-2 border-brass/60" />
            <span className="absolute bottom-5 right-5 h-5 w-5 border-b-2 border-r-2 border-brass/60" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-brass/30 bg-brass/10 px-4 py-1.5 text-xs font-semibold text-brass font-display mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Free · No Account Required</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-flash leading-tight">
                Ready to see your room<br className="hidden sm:block" /> differently?
              </h2>
              <p className="mt-4 mx-auto max-w-md text-base text-flash/60 leading-relaxed">
                It takes one photo. The recommendations are free to browse — no
                account needed until you want to save a room look.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/room"
                  id="footer-cta-scan-room"
                  className="group flex items-center gap-2.5 rounded-full bg-brass px-7 py-3.5 font-display text-sm font-bold text-ink hover:bg-flash transition-all duration-300 shadow-elevation"
                >
                  <Camera className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span>Start with a photo</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/catalog"
                  className="flex items-center gap-2 rounded-full border border-flash/20 px-6 py-3.5 font-display text-sm font-medium text-flash/70 hover:text-flash hover:border-flash/40 transition-colors"
                >
                  Browse the catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
