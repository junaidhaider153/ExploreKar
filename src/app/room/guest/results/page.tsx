"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Camera, ArrowLeft, Layers, UserPlus, Info } from "lucide-react";
import { scoreProducts } from "@/lib/recommend";
import { CURATED_PRODUCTS } from "@/lib/catalog-data";
import { DEMO_ROOMS } from "@/lib/demo-rooms";
import { ProductCard } from "@/components/ProductCard";
import { RoomPreviewCanvas } from "@/components/RoomPreviewCanvas";

export default function GuestRoomResultsPage() {
  const searchParams = useSearchParams();
  const demoId = searchParams.get("demo");
  const productParam = searchParams.get("product");

  const [guestRoom, setGuestRoom] = useState<{
    photoUrl: string;
    roomType: string;
    styleTags: string[];
    dominantColors: string[];
    colorPalette?: string[];
    notes?: string;
  } | null>(null);

  useEffect(() => {
    // 1. Check if user clicked a demo room
    if (demoId) {
      const demo = DEMO_ROOMS.find((d) => d.id === demoId) || DEMO_ROOMS[0];
      setGuestRoom({
        photoUrl: demo.photoUrl,
        roomType: demo.roomType,
        styleTags: demo.styleTags,
        dominantColors: demo.dominantColors,
        notes: demo.notes,
      });
      return;
    }

    // 2. Check if user uploaded a guest photo saved in sessionStorage
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("explorekar_guest_room");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setGuestRoom({
            photoUrl: parsed.photoUrl,
            roomType: parsed.analysis?.room_type || "living-room",
            styleTags: parsed.analysis?.style_tags || ["minimal", "modern"],
            dominantColors: parsed.analysis?.dominant_colors || ["warm-neutral"],
            colorPalette: parsed.analysis?.color_palette,
            notes: parsed.analysis?.notes || "A thoughtfully balanced space.",
          });
          return;
        } catch (e) {
          console.error("Error reading guest room:", e);
        }
      }
    }

    // Default fallback to first demo room
    const defaultDemo = DEMO_ROOMS[0];
    setGuestRoom({
      photoUrl: defaultDemo.photoUrl,
      roomType: defaultDemo.roomType,
      styleTags: defaultDemo.styleTags,
      dominantColors: defaultDemo.dominantColors,
      notes: defaultDemo.notes,
    });
  }, [demoId]);

  if (!guestRoom) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-6 w-6 text-brass animate-spin mx-auto" />
          <p className="mt-2 text-xs text-ink-muted">Loading room studio…</p>
        </div>
      </div>
    );
  }

  // Format products for recommendation engine
  const formattedProducts = CURATED_PRODUCTS.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price_cents: p.price_cents,
    currency: p.currency,
    primary_image_path: p.primary_image_path,
    tags: p.tags,
  }));

  const ranked = scoreProducts(formattedProducts, {
    room_type: guestRoom.roomType,
    style_tags: guestRoom.styleTags,
    dominant_colors: guestRoom.dominantColors,
  });

  const featured = productParam
    ? ranked.find((p) => p.slug === productParam) ?? ranked[0]
    : ranked[0];

  const featuredCurated = CURATED_PRODUCTS.find((p) => p.slug === featured?.slug) || CURATED_PRODUCTS[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Back to Capture navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/room"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:text-brass transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Upload Another Photo</span>
        </Link>

        {/* Guest Sign-up Prompt */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-brass/40 bg-brass-light/40 px-3.5 py-1.5 text-xs text-ink">
          <Sparkles className="h-3.5 w-3.5 text-brass" />
          <span>Guest Preview Mode</span>
          <Link
            href="/signup"
            className="ml-1 font-bold underline underline-offset-2 hover:text-brass"
          >
            Create account to save looks
          </Link>
        </div>
      </div>

      {/* Room AI Analysis Header Card */}
      <div className="mt-6 rounded-3xl border border-line bg-flash p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-moss-light px-3 py-1 text-xs font-semibold text-moss font-display">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Spatial Analysis</span>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink capitalize">
              {guestRoom.roomType.replace("-", " ")}
            </h1>
            {guestRoom.notes && (
              <p className="mt-1.5 text-xs sm:text-sm text-ink-muted max-w-xl leading-relaxed">
                &ldquo;{guestRoom.notes}&rdquo;
              </p>
            )}
          </div>

          {/* Detected Style Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl border border-line bg-paper-light p-3">
              <span className="block text-[10px] uppercase font-semibold text-ink-muted">
                Detected Styles
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {guestRoom.styleTags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-moss-light px-2 py-0.5 text-xs font-medium text-moss capitalize"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-paper-light p-3">
              <span className="block text-[10px] uppercase font-semibold text-ink-muted">
                Color Harmony
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {guestRoom.dominantColors.map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-paper-dark px-2 py-0.5 text-xs font-medium text-ink capitalize"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 2D Studio Canvas Section */}
      {featured && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Visualizer Studio: {featuredCurated.title}
              </h2>
              <p className="text-xs text-ink-muted">
                Drag the outlined piece to position on your wall. Use the sliders to adjust scale and rotation.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-flash p-4 sm:p-6 shadow-elevation">
            <RoomPreviewCanvas
              roomId="guest-session"
              roomPhotoUrl={guestRoom.photoUrl}
              productId={featuredCurated.id}
              productImageUrl={featuredCurated.imageUrl}
              productTitle={featuredCurated.title}
            />
          </div>
        </section>
      )}

      {/* Matched Furniture Recommendations */}
      <section className="mt-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              Curated Matches for Your Space
            </h2>
            <p className="text-xs text-ink-muted">
              Ranked by material and color harmony with your room.
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-semibold text-ink underline underline-offset-4 hover:text-brass"
          >
            Explore all pieces →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
          {ranked.slice(0, 8).map((p) => {
            const curated = CURATED_PRODUCTS.find((c) => c.slug === p.slug) || CURATED_PRODUCTS[0];
            return (
              <ProductCard
                key={p.id}
                product={{
                  slug: p.slug,
                  title: p.title,
                  price_cents: p.price_cents,
                  currency: p.currency,
                  imageUrl: curated.imageUrl,
                  categoryName: curated.category.name,
                  width_cm: curated.width_cm,
                  height_cm: curated.height_cm,
                  depth_cm: curated.depth_cm,
                  matchReasons: p.matchReasons,
                  tags: p.tags,
                }}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
