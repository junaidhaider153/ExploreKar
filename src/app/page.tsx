import Link from "next/link";
import Image from "next/image";
import { Camera, Sparkles, ArrowRight, ShieldCheck, Truck, Heart, Layers, Grid } from "lucide-react";
import { CURATED_PRODUCTS } from "@/lib/catalog-data";
import { DEMO_ROOMS } from "@/lib/demo-rooms";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/format";

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
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-light px-4 py-1.5 text-xs font-semibold text-ink-soft font-display">
              <span>Handcrafted Furniture &amp; Decor · Pakistan</span>
            </div>

            <h1 className="mt-5 max-w-lg font-display text-5xl leading-[1.04] tracking-tight text-ink sm:text-6xl">
              Furniture that fits your{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-brass">space</span>
                <span className="absolute -bottom-1 left-0 h-3 w-full rounded-sm bg-brass/15 -z-0" />
              </span>{" "}
              and your style.
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70 sm:text-lg">
              Handpicked pieces for every room, from statement seating to
              considered decor — with an AI room-visualizer built in when
              you want to see a piece in your own space first.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/catalog"
                id="hero-shop-cta"
                className="group flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 font-display text-sm font-bold text-flash hover:bg-moss transition-all duration-300 shadow-elevation"
              >
                <Grid className="h-4 w-4 text-brass transition-transform group-hover:scale-110" />
                <span>Shop the Collection</span>
              </Link>
              <Link
                href="/room"
                id="hero-scan-room-cta"
                className="group flex items-center gap-2 text-sm font-semibold text-ink/70 hover:text-ink transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-brass" />
                <span>New: preview any piece in your room</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
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

          {/* Right: Featured Products, not the AI demo — the storefront leads with what's for sale */}
          <div className="grid grid-cols-2 gap-3 max-w-lg ml-auto">
            {FEATURED_PRODUCTS.map((p, i) => (
              <Link
                key={p.id}
                href={`/catalog/${p.slug}`}
                className={`group relative overflow-hidden rounded-3xl border border-line bg-paper-light shadow-sm hover:border-brass/50 hover:shadow-elevation transition-all duration-500 ${
                  i === 0 ? "col-span-2 aspect-video" : "aspect-square"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-display text-xs font-bold text-flash/90">{p.title}</p>
                  <p className="text-[10px] text-flash/60">{formatPrice(p.price_cents, p.currency)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI VISUALIZER (feature banner, not the site's primary path) ──── */}
      <section className="border-t border-line bg-flash">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-brass/30 bg-brass-light px-3 py-1 text-xs font-semibold text-brass font-display">
                <Sparkles className="h-3 w-3" />
                <span>New Feature</span>
              </div>
              <h2 className="mt-3 max-w-sm font-display text-3xl font-extrabold tracking-tight text-ink">
                Preview any piece in your room first.
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-muted">
                One photo, three steps — see how a piece actually looks in
                your space before it ships.
              </p>
            </div>
            <Link
              href="/room"
              className="self-start sm:self-auto flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 font-display text-xs font-bold text-ink hover:bg-ink hover:text-flash transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
              Try it now
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
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

                    {/* Connector arrow (not on last, desktop 3-col only) */}
                    {i < HOW_IT_WORKS.length - 1 && (
                      <div className="hidden sm:flex lg:hidden absolute -right-3.5 top-1/2 -translate-y-1/2 h-7 w-7 items-center justify-center rounded-full border border-line bg-flash text-ink-muted z-10 shadow-sm">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Demo rooms — try the visualizer without uploading a photo */}
            <div className="grid grid-cols-2 gap-3">
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
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="rounded-full bg-brass px-4 py-1.5 font-display text-xs font-bold text-ink shadow-md">
                      Try this room →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
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
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-flash leading-tight">
                Find your next piece,<br className="hidden sm:block" /> however you like to shop.
              </h2>
              <p className="mt-4 mx-auto max-w-md text-base text-flash/60 leading-relaxed">
                Browse the full collection, or start with a photo of your
                room and let the visualizer find what fits — free, no
                account required until you want to save a look.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/catalog"
                  id="footer-cta-shop"
                  className="group flex items-center gap-2.5 rounded-full bg-brass px-7 py-3.5 font-display text-sm font-bold text-ink hover:bg-flash transition-all duration-300 shadow-elevation"
                >
                  <Grid className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span>Shop the Collection</span>
                </Link>
                <Link
                  href="/room"
                  id="footer-cta-scan-room"
                  className="flex items-center gap-2 rounded-full border border-flash/20 px-6 py-3.5 font-display text-sm font-medium text-flash/70 hover:text-flash hover:border-flash/40 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  Preview a piece in your room
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
