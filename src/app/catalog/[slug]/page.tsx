import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Ruler,
} from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { productImageUrl } from "@/lib/storage";
import { formatPrice } from "@/lib/format";
import { safeJsonLd } from "@/lib/json-ld";
import { CURATED_PRODUCTS } from "@/lib/catalog-data";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailClient } from "@/components/ProductDetailClient";

// Was silently ignored before this page used the anon/cacheable Supabase
// client — the cookie-bound client forces fully dynamic rendering
// regardless of what's exported here, so this had no effect until now.
export const revalidate = 60;

type Props = {
  params: { slug: string };
};

// Helper to fetch product from Supabase or Fallback
async function getProductData(slug: string) {
  const supabase = createPublicClient();
  try {
    const { data: product } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (product) {
      return {
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        price_cents: product.price_cents,
        currency: product.currency,
        categoryName: product.categories?.name || "Decor",
        categorySlug: product.categories?.slug || "decor",
        width_cm: product.width_cm,
        height_cm: product.height_cm,
        depth_cm: product.depth_cm,
        tags: product.tags || [],
        imageUrl: productImageUrl(product.primary_image_path),
      };
    }
  } catch (err) {
    // See catalog/page.tsx for why this is logged rather than swallowed.
    console.error(`Product detail: failed to load "${slug}" from Supabase, using curated fallback:`, err);
  }

  // Fallback to curated catalog
  const fallback = CURATED_PRODUCTS.find((p) => p.slug === slug);
  if (fallback) {
    return {
      id: fallback.id,
      slug: fallback.slug,
      title: fallback.title,
      description: fallback.description,
      price_cents: fallback.price_cents,
      currency: fallback.currency,
      categoryName: fallback.category.name,
      categorySlug: fallback.category.slug,
      width_cm: fallback.width_cm,
      height_cm: fallback.height_cm,
      depth_cm: fallback.depth_cm,
      tags: fallback.tags,
      imageUrl: fallback.imageUrl,
    };
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductData(params.slug);
  if (!product) return { title: "Product Not Found — ExploreKar" };

  const title = `${product.title} — ExploreKar`;
  const description =
    product.description || `Preview the ${product.title} in your room before purchasing on ExploreKar.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: product.imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductData(params.slug);
  if (!product) notFound();

  // Related products recommendation
  const relatedProducts = CURATED_PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4);

  const tags: string[] = product.tags || [];
  const styleTags = tags
    .filter((t: string) => t.startsWith("style:"))
    .map((t: string) => t.replace("style:", ""));
  const roomTags = tags
    .filter((t: string) => t.startsWith("room:"))
    .map((t: string) => t.replace("room:", "").replace("-", " "));
  const materialTags = tags
    .filter((t: string) => t.startsWith("material:"))
    .map((t: string) => t.replace("material:", ""));

  // JSON-LD structured schema for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.imageUrl,
    description: product.description,
    offers: {
      "@type": "Offer",
      price: (product.price_cents / 100).toFixed(2),
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Inject JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Link href="/" className="hover:text-ink flex items-center gap-1 transition-colors">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-line-dark" />
        <Link href="/catalog" className="hover:text-ink transition-colors">
          Catalog
        </Link>
        <ChevronRight className="h-3 w-3 text-line-dark" />
        <span className="text-ink-muted capitalize">{product.categoryName}</span>
        <ChevronRight className="h-3 w-3 text-line-dark" />
        <span className="font-semibold text-ink truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Product Media Gallery */}
        <div className="lg:col-span-7">
          <div className="viewfinder-frame relative aspect-square w-full overflow-hidden rounded-3xl border border-line bg-flash shadow-elevation">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            {/* Category Overlay Tag */}
            <div className="absolute top-4 left-4 z-20">
              <span className="rounded-full glass-hud px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                {product.categoryName}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Visualizer Trigger */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brass-light px-3 py-1 text-xs font-semibold text-brass font-display">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Spatial Collection</span>
            </span>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink leading-tight">
              {product.title}
            </h1>
            <p className="mt-3 font-display text-2xl font-bold text-ink">
              {formatPrice(product.price_cents, product.currency)}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-ink-muted">{product.description}</p>

          {/* CTA: WhatsApp Inquiry + Room Preview + Wishlist */}
          <ProductDetailClient
            productSlug={product.slug}
            productTitle={product.title}
            productPriceCents={product.price_cents}
            productCurrency={product.currency}
            productImageUrl={product.imageUrl}
          />

          {/* Real-World Spatial Dimensions Breakdown */}
          {(product.width_cm || product.height_cm || product.depth_cm) && (
            <div className="rounded-2xl border border-line bg-flash p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink uppercase tracking-wider font-display">
                <Ruler className="h-4 w-4 text-brass" />
                <span>Spatial Dimensions</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-paper-light border border-line/60 p-3">
                  <span className="block text-[11px] text-ink-muted">Width</span>
                  <span className="mt-1 block font-display text-sm font-bold text-ink">
                    {product.width_cm ?? "—"} cm
                  </span>
                </div>
                <div className="rounded-xl bg-paper-light border border-line/60 p-3">
                  <span className="block text-[11px] text-ink-muted">Height</span>
                  <span className="mt-1 block font-display text-sm font-bold text-ink">
                    {product.height_cm ?? "—"} cm
                  </span>
                </div>
                <div className="rounded-xl bg-paper-light border border-line/60 p-3">
                  <span className="block text-[11px] text-ink-muted">Depth</span>
                  <span className="mt-1 block font-display text-sm font-bold text-ink">
                    {product.depth_cm ?? "—"} cm
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tags & Design Compatibility */}
          <div className="space-y-3">
            {roomTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-ink-muted">Ideal Rooms:</span>
                {roomTags.map((r: string) => (
                  <span
                    key={r}
                    className="rounded-lg bg-paper-light border border-line px-2.5 py-1 text-xs font-medium text-ink capitalize"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
            {styleTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-ink-muted">Aesthetic:</span>
                {styleTags.map((s: string) => (
                  <span
                    key={s}
                    className="rounded-lg bg-moss-light border border-moss/20 px-2.5 py-1 text-xs font-medium text-moss capitalize"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            {materialTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-ink-muted">Material:</span>
                {materialTags.map((m: string) => (
                  <span
                    key={m}
                    className="rounded-lg bg-terracotta-light border border-terracotta/20 px-2.5 py-1 text-xs font-medium text-terracotta capitalize"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Delivery & Assurance Pills */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-ink-muted">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-moss shrink-0" />
              <span>Free Delivery in Major Cities</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-moss shrink-0" />
              <span>Handcrafted Quality Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <section className="mt-24 border-t border-line pt-14">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Complementary Pieces
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Explore pieces curated to pair naturally with the {product.title}.
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-semibold text-ink underline underline-offset-4 hover:text-brass transition-colors"
          >
            View Full Catalog →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
          {relatedProducts.map((p) => (
            <ProductCard
              key={p.slug}
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
      </section>
    </div>
  );
}
