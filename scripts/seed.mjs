// One-time/dev seed: creates a handful of categories + products so the
// catalog and recommendation flow have something real to show.
// Usage: SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... npm run seed
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.",
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const categories = [
  { slug: "seating", name: "Seating", room_tags: ["living-room", "office", "bedroom"] },
  { slug: "tables", name: "Tables", room_tags: ["living-room", "dining-room", "office"] },
  { slug: "storage", name: "Storage", room_tags: ["bedroom", "living-room", "office"] },
  { slug: "lighting", name: "Lighting", room_tags: ["living-room", "bedroom", "office"] },
  { slug: "decor", name: "Decor", room_tags: ["living-room", "bedroom", "office", "dining-room"] },
];

// primary_image_path points at placeholder images you should replace with real
// product photography uploaded to the `product-images` bucket.
const products = [
  {
    slug: "walnut-coffee-table",
    title: "Walnut Coffee Table",
    description: "Solid walnut coffee table with tapered legs, seats a full tray set.",
    price_cents: 4500000,
    category_slug: "tables",
    tags: ["style:mid-century", "color:warm-neutral", "material:wood", "room:living-room"],
    width_cm: 110,
    height_cm: 45,
    depth_cm: 60,
    primary_image_path: "placeholders/walnut-coffee-table.jpg",
  },
  {
    slug: "linen-lounge-chair",
    title: "Linen Lounge Chair",
    description: "Boucle-style linen armchair on oak legs.",
    price_cents: 6200000,
    category_slug: "seating",
    tags: ["style:minimal", "color:neutral", "material:fabric", "room:living-room"],
    width_cm: 75,
    height_cm: 80,
    depth_cm: 78,
    primary_image_path: "placeholders/linen-lounge-chair.jpg",
  },
  {
    slug: "brass-arc-floor-lamp",
    title: "Brass Arc Floor Lamp",
    description: "Overarching brass floor lamp with a linen drum shade.",
    price_cents: 2800000,
    category_slug: "lighting",
    tags: ["style:mid-century", "color:gold", "material:metal", "room:living-room"],
    width_cm: 40,
    height_cm: 190,
    depth_cm: 40,
    primary_image_path: "placeholders/brass-arc-floor-lamp.jpg",
  },
  {
    slug: "oak-bookshelf",
    title: "Modular Oak Bookshelf",
    description: "Five-tier open bookshelf in solid oak.",
    price_cents: 3900000,
    category_slug: "storage",
    tags: ["style:minimal", "color:light-wood", "material:wood", "room:office", "room:living-room"],
    width_cm: 90,
    height_cm: 180,
    depth_cm: 35,
    primary_image_path: "placeholders/oak-bookshelf.jpg",
  },
  {
    slug: "terracotta-vase-set",
    title: "Terracotta Vase Set",
    description: "Hand-thrown terracotta vase trio, matte finish.",
    price_cents: 650000,
    category_slug: "decor",
    tags: ["style:earthy", "color:terracotta", "material:ceramic", "room:living-room", "room:bedroom"],
    width_cm: 15,
    height_cm: 30,
    depth_cm: 15,
    primary_image_path: "placeholders/terracotta-vase-set.jpg",
  },
  {
    slug: "platform-bed-frame",
    title: "Platform Bed Frame",
    description: "Low-profile platform bed frame, natural oak veneer.",
    price_cents: 5800000,
    category_slug: "storage",
    tags: ["style:minimal", "color:light-wood", "material:wood", "room:bedroom"],
    width_cm: 160,
    height_cm: 35,
    depth_cm: 200,
    primary_image_path: "placeholders/platform-bed-frame.jpg",
  },
];

async function main() {
  console.log("Seeding categories...");
  const { data: catRows, error: catErr } = await supabase
    .from("categories")
    .upsert(categories, { onConflict: "slug" })
    .select();
  if (catErr) throw catErr;

  const catBySlug = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

  console.log("Seeding products...");
  const rows = products.map(({ category_slug, ...p }) => ({
    ...p,
    category_id: catBySlug[category_slug] ?? null,
  }));

  const { error: prodErr } = await supabase.from("products").upsert(rows, { onConflict: "slug" });
  if (prodErr) throw prodErr;

  console.log(`Done. Seeded ${catRows.length} categories and ${rows.length} products.`);
  console.log(
    "Note: primary_image_path values are placeholders — upload real photos to the " +
      "'product-images' bucket at those paths, or update the rows afterward.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
