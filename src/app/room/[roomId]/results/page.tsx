import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Layers, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { productImageUrl } from "@/lib/storage";
import { scoreProducts } from "@/lib/recommend";
import { ProductCard } from "@/components/ProductCard";
import { RoomPreviewCanvas } from "@/components/RoomPreviewCanvas";
import { CURATED_PRODUCTS } from "@/lib/catalog-data";

export default async function RoomResultsPage({
  params,
  searchParams,
}: {
  params: { roomId: string };
  searchParams: { product?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, image_path, room_type, style_tags, dominant_colors, analysis_status, notes:analysis_raw")
    .eq("id", params.roomId)
    .single();
  if (!room) notFound();

  const { data: signedPhoto } = await supabase.storage
    .from("room-photos")
    .createSignedUrl(room.image_path, 60 * 60 * 24);

  const { data: dbProducts } = await supabase
    .from("products")
    .select("id, slug, title, price_cents, currency, primary_image_path, tags")
    .eq("is_active", true);

  // Fallback to curated catalog products if empty
  const catalogList = dbProducts && dbProducts.length > 0
    ? dbProducts.map((p) => ({
        ...p,
        imageUrl: productImageUrl(p.primary_image_path),
      }))
    : CURATED_PRODUCTS.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        price_cents: p.price_cents,
        currency: p.currency,
        primary_image_path: p.primary_image_path,
        imageUrl: p.imageUrl,
        tags: p.tags,
      }));

  const ranked = scoreProducts(catalogList, {
    room_type: room.room_type,
    style_tags: room.style_tags ?? [],
    dominant_colors: room.dominant_colors ?? [],
  });

  const featured = searchParams.product
    ? ranked.find((p) => p.slug === searchParams.product) ?? ranked[0]
    : ranked[0];

  let existingPlacement:
    | { x: number; y: number; scale: number; rotationDeg: number }
    | undefined;
  if (featured) {
    const { data: placementRow } = await supabase
      .from("room_placements")
      .select("x, y, scale, rotation_deg")
      .eq("room_id", room.id)
      .eq("product_id", featured.id)
      .maybeSingle();
    if (placementRow) {
      existingPlacement = {
        x: Number(placementRow.x),
        y: Number(placementRow.y),
        scale: Number(placementRow.scale),
        rotationDeg: Number(placementRow.rotation_deg),
      };
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/room"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:text-brass transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Upload Another Room</span>
        </Link>
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
              {room.analysis_status === "done" && room.room_type
                ? `${room.room_type.replace("-", " ")} Studio`
                : "Reading your space…"}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-ink-muted max-w-xl leading-relaxed">
              Drag, scale, and layer pieces in your room. When satisfied, save the placement or export a high-res snapshot.
            </p>
          </div>

          {/* Detected Style Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {room.style_tags?.length ? (
              <div className="rounded-2xl border border-line bg-paper-light p-3">
                <span className="block text-[10px] uppercase font-semibold text-ink-muted">
                  Detected Styles
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {room.style_tags.map((t: string) => (
                    <span
                      key={t}
                      className="rounded-md bg-moss-light px-2 py-0.5 text-xs font-medium text-moss capitalize"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {room.dominant_colors?.length ? (
              <div className="rounded-2xl border border-line bg-paper-light p-3">
                <span className="block text-[10px] uppercase font-semibold text-ink-muted">
                  Color Harmony
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {room.dominant_colors.map((c: string) => (
                    <span
                      key={c}
                      className="rounded-md bg-paper-dark px-2 py-0.5 text-xs font-medium text-ink capitalize"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Multi-Item Studio Canvas Section */}
      {featured && signedPhoto?.signedUrl && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Visualizer Studio: {featured.title}
              </h2>
              <p className="text-xs text-ink-muted">
                Compose multiple pieces, adjust lighting shadows, and reposition on your photo.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-flash p-4 sm:p-6 shadow-elevation">
            <RoomPreviewCanvas
              roomId={room.id}
              roomPhotoUrl={signedPhoto.signedUrl}
              productId={featured.id}
              productImageUrl={(featured as any).imageUrl || productImageUrl(featured.primary_image_path)}
              productTitle={featured.title}
              initialPlacement={existingPlacement}
              availableProducts={catalogList}
            />
          </div>
        </section>
      )}

      {/* Complementary Furniture Grid */}
      <section className="mt-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              Matches for this Room
            </h2>
            <p className="text-xs text-ink-muted">
              Ranked by harmony with your wall color and room style.
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
          {ranked.slice(0, 8).map((p) => (
            <ProductCard
              key={p.id}
              product={{
                slug: p.slug,
                title: p.title,
                price_cents: p.price_cents,
                currency: p.currency,
                imageUrl: (p as any).imageUrl || productImageUrl(p.primary_image_path),
                matchReasons: p.matchReasons,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
