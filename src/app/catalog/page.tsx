import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Sparkles, Home, ChevronRight, Layers } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { productImageUrl } from "@/lib/storage";
import { CatalogFilters } from "@/components/CatalogFilters";
import { CURATED_PRODUCTS } from "@/lib/catalog-data";
import type { ProductCardData } from "@/components/ProductCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Curated Furniture & Spatial Decor Catalog — ExploreKar",
  description:
    "Explore modern handcrafted furniture, architectural lighting, and bespoke decor. Preview any piece in your own living space with AI vision analysis.",
  openGraph: {
    title: "Curated Furniture & Spatial Decor Catalog — ExploreKar",
    description: "Browse furniture designed to fit your room's style, colors, and spatial geometry.",
  },
};

export default async function CatalogPage() {
  const supabase = createPublicClient();
  let dbProducts: ProductCardData[] = [];

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("slug, title, price_cents, currency, primary_image_path, tags, width_cm, height_cm, depth_cm, categories(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && products && products.length > 0) {
      dbProducts = products.map((p: any) => ({
        slug: p.slug,
        title: p.title,
        price_cents: p.price_cents,
        currency: p.currency,
        imageUrl: productImageUrl(p.primary_image_path),
        categoryName: p.categories?.name,
        width_cm: p.width_cm,
        height_cm: p.height_cm,
        depth_cm: p.depth_cm,
        tags: p.tags,
      }));
    }
  } catch (err) {
    // Previously silent — a real DB failure here looked identical to "just
    // no products yet", so a misconfigured key or a timeout was invisible
    // in Vercel's logs. Logging it doesn't fix the underlying failure, but
    // it makes it diagnosable instead of a mystery "why is it showing demo
    // data" report.
    console.error("Catalog: failed to load products from Supabase, using curated fallback:", err);
    // If Supabase is unseeded, fallback to curated dataset
  }

  // Combine or fallback to curated catalog data
  const finalProducts: ProductCardData[] = dbProducts.length > 0
    ? dbProducts
    : CURATED_PRODUCTS.map((p) => ({
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
      }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Link href="/" className="hover:text-ink flex items-center gap-1 transition-colors">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-line-dark" />
        <span className="font-semibold text-ink">Catalog</span>
      </nav>

      {/* Catalog Hero Banner */}
      <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 rounded-3xl border border-line bg-flash p-8 shadow-sm">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brass-light px-3 py-1 text-xs font-semibold text-brass font-display mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Curated Architectural Collection</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Explore Furniture & Decor
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Every piece in our catalog is mapped with real dimensions and spatial tags. Upload your room photo to see which pieces harmonize with your space.
          </p>
        </div>

        {/* Visualizer Fast-Track Card */}
        <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-center gap-3 glass-hud p-4 rounded-2xl">
          <div className="h-10 w-10 rounded-xl bg-brass/20 text-brass flex items-center justify-center shrink-0">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-flash">Not sure what fits?</p>
            <p className="text-[11px] text-flash/70">Let AI scan your room in 5 seconds</p>
          </div>
          <Link
            href="/room"
            className="w-full sm:w-auto whitespace-nowrap rounded-xl bg-brass px-4 py-2 text-xs font-bold text-ink hover:bg-brass-hover transition-colors text-center"
          >
            Scan Room
          </Link>
        </div>
      </div>

      {/* Interactive Filter and Products Grid */}
      <CatalogFilters initialProducts={finalProducts} />
    </div>
  );
}
