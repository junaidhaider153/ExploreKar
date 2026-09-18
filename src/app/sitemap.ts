import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site";
import { CURATED_PRODUCTS } from "@/lib/catalog-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  let dbProducts: { slug: string; created_at?: string | null }[] = [];

  try {
    const { data } = await supabase
      .from("products")
      .select("slug, created_at")
      .eq("is_active", true);

    if (data && data.length > 0) {
      dbProducts = data;
    }
  } catch {
    // Database fallback
  }

  // Combine database products with curated fallback items (deduped by slug)
  const slugMap = new Map<string, string | undefined>();
  for (const p of CURATED_PRODUCTS) {
    slugMap.set(p.slug, undefined);
  }
  for (const p of dbProducts) {
    slugMap.set(p.slug, p.created_at ?? undefined);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/catalog`, changeFrequency: "daily", priority: 0.9 },
  ];

  const productRoutes: MetadataRoute.Sitemap = Array.from(slugMap.entries()).map(
    ([slug, lastModified]) => ({
      url: `${siteUrl}/catalog/${slug}`,
      lastModified: lastModified || undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  return [...staticRoutes, ...productRoutes];
}
