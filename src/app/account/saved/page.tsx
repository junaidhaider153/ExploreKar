import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Heart,
  Layers,
  Camera,
  ArrowLeft,
  Sparkles,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { productImageUrl } from "@/lib/storage";
import { formatPrice } from "@/lib/format";
import { CURATED_PRODUCTS } from "@/lib/catalog-data";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Saved Rooms & Wishlist — ExploreKar",
  description:
    "Your saved room designs and wishlisted furniture pieces on ExploreKar.",
};

export default async function SavedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect guests to login with return URL
  if (!user) {
    redirect("/login?next=/account/saved");
  }

  // ── 1. Fetch saved rooms ─────────────────────────────────────────────────
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, image_path, room_type, style_tags, dominant_colors, analysis_status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(12);

  // Generate signed URLs for room thumbnails (24-hour expiry)
  const roomsWithUrls = await Promise.all(
    (rooms || []).map(async (room) => {
      const { data: signed } = await supabase.storage
        .from("room-photos")
        .createSignedUrl(room.image_path, 60 * 60 * 24);
      return { ...room, photoUrl: signed?.signedUrl || null };
    })
  );

  // ── 2. Fetch wishlisted products ─────────────────────────────────────────
  const { data: wishlistRows } = await supabase
    .from("wishlists")
    .select("product_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const wishlistProductIds = (wishlistRows || []).map(
    (row: { product_id: string }) => row.product_id
  );

  // Try DB first, fallback to curated products
  let wishlistProducts: typeof CURATED_PRODUCTS = [];
  if (wishlistProductIds.length > 0) {
    const { data: dbProds } = await supabase
      .from("products")
      .select("id, slug, title, price_cents, currency, primary_image_path, tags, width_cm, height_cm, depth_cm")
      .in("id", wishlistProductIds)
      .eq("is_active", true);

    if (dbProds && dbProds.length > 0) {
      // Map to curated format
      wishlistProducts = dbProds.map((p: any) => ({
        ...p,
        imageUrl: productImageUrl(p.primary_image_path),
        category: { slug: "decor", name: "Decor" },
        description: "",
        roomTypes: [],
        style: "",
        material: "",
        is_active: true,
      }));
    } else {
      // Fallback: match product IDs against curated catalog slugs
      wishlistProducts = CURATED_PRODUCTS.filter((p) =>
        wishlistProductIds.includes(p.slug) || wishlistProductIds.includes(p.id)
      );
    }
  }

  const hasRooms = roomsWithUrls.length > 0;
  const hasWishlist = wishlistProducts.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:text-brass transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-brass-light px-3 py-1 text-xs font-semibold text-brass font-display">
          <Sparkles className="h-3.5 w-3.5" />
          My Design Studio
        </span>
      </div>

      {/* Page Title */}
      <div className="mt-8">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
          My Saved Looks
        </h1>
        <p className="mt-2 text-sm text-ink-muted max-w-xl">
          Your room designs and curated wishlist — all in one place.
        </p>
      </div>

      {/* ── Saved Room Designs ─────────────────────────────────────────── */}
      <section className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-xl bg-ink text-flash flex items-center justify-center shadow-sm">
            <Camera className="h-4 w-4 text-brass" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              Saved Room Designs
            </h2>
            <p className="text-xs text-ink-muted">
              {hasRooms
                ? `${roomsWithUrls.length} room${roomsWithUrls.length > 1 ? "s" : ""} analysed`
                : "No rooms saved yet"}
            </p>
          </div>
        </div>

        {hasRooms ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomsWithUrls.map((room) => (
              <div
                key={room.id}
                className="group relative overflow-hidden rounded-3xl border border-line bg-flash shadow-sm hover:shadow-elevation transition-all duration-300 hover:border-brass/40"
              >
                {/* Room Photo */}
                <div className="relative aspect-video w-full overflow-hidden bg-paper-light">
                  {room.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={room.photoUrl}
                      alt={`${room.room_type || "Room"} design`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Camera className="h-10 w-10 text-ink-muted/30" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        room.analysis_status === "done"
                          ? "bg-moss-light text-moss"
                          : room.analysis_status === "failed"
                          ? "bg-terracotta-light text-terracotta"
                          : "bg-brass-light text-brass"
                      }`}
                    >
                      {room.analysis_status === "done"
                        ? "Analysed"
                        : room.analysis_status === "failed"
                        ? "Failed"
                        : "Processing"}
                    </span>
                  </div>
                </div>

                {/* Room Info */}
                <div className="p-5">
                  <h3 className="font-display text-sm font-bold text-ink capitalize">
                    {room.room_type?.replace("-", " ") || "Room Design"}
                  </h3>

                  {/* Style Tags */}
                  {room.style_tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {room.style_tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-md bg-paper-light border border-line px-2 py-0.5 text-[11px] text-ink-muted capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    {room.analysis_status === "done" ? (
                      <Link
                        href={`/room/${room.id}/results`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-xs font-display font-bold text-flash hover:bg-moss transition-colors"
                      >
                        <Layers className="h-3.5 w-3.5 text-brass" />
                        <span>Reopen Studio</span>
                      </Link>
                    ) : (
                      <span className="flex-1 rounded-full border border-line bg-paper-light px-4 py-2.5 text-center text-xs text-ink-muted">
                        Analysis pending…
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-3xl border border-dashed border-line bg-paper-light p-12 text-center">
            <Camera className="mx-auto h-12 w-12 text-ink-muted/30" />
            <h3 className="mt-4 font-display text-base font-bold text-ink">
              No rooms saved yet
            </h3>
            <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto">
              Upload a photo of your room and we&apos;ll analyse it, then match furniture to your style.
            </p>
            <Link
              href="/room"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-display text-xs font-bold text-flash hover:bg-moss transition-colors"
            >
              <Camera className="h-4 w-4 text-brass" />
              <span>Analyse My First Room</span>
            </Link>
          </div>
        )}
      </section>

      {/* ── Wishlisted Products ─────────────────────────────────────────── */}
      <section className="mt-16 border-t border-line pt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-terracotta-light text-terracotta flex items-center justify-center">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">
                My Wishlist
              </h2>
              <p className="text-xs text-ink-muted">
                {hasWishlist
                  ? `${wishlistProducts.length} piece${wishlistProducts.length > 1 ? "s" : ""} saved`
                  : "Nothing saved yet"}
              </p>
            </div>
          </div>

          <Link
            href="/catalog"
            className="text-xs font-semibold text-ink underline underline-offset-4 hover:text-brass transition-colors"
          >
            Browse Catalog →
          </Link>
        </div>

        {hasWishlist ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
            {wishlistProducts.map((p) => (
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
        ) : (
          /* Empty State */
          <div className="rounded-3xl border border-dashed border-line bg-paper-light p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-ink-muted/30" />
            <h3 className="mt-4 font-display text-base font-bold text-ink">
              Your wishlist is empty
            </h3>
            <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto">
              Tap the heart icon on any product to save it here for later.
            </p>
            <Link
              href="/catalog"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-display text-xs font-bold text-flash hover:bg-moss transition-colors"
            >
              <BookmarkCheck className="h-4 w-4 text-brass" />
              <span>Explore the Catalog</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
