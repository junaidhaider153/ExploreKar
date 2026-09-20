// v1 recommendation logic: simple, explainable tag-overlap scoring.
// Deliberately not ML — it's fast, has zero training/inference cost, and is
// easy to debug ("why was this recommended?" always has a clear answer).
// Swap in a real ranking model later once you have usage data to train on;
// this keeps the same input/output shape so callers won't need to change.

export type Product = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  currency: string;
  primary_image_path: string;
  tags: string[];
  /** Pre-resolved image URL, when the caller already has one (e.g. curated catalog items). Falls back to primary_image_path + productImageUrl() when absent. */
  imageUrl?: string;
};

export type RoomAnalysis = {
  room_type: string | null;
  style_tags: string[];
  dominant_colors: string[];
};

export type ScoredProduct = Product & { matchScore: number; matchReasons: string[] };

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

/**
 * Scores each product against a room's analysis. A product's tags look like
 * "style:mid-century", "color:warm-neutral", "room:living-room" — we compare
 * the room's inferred room_type/style_tags/dominant_colors against those.
 */
export function scoreProducts(products: Product[], room: RoomAnalysis): ScoredProduct[] {
  const roomSignals = new Set(
    [
      room.room_type ? `room:${normalizeTag(room.room_type)}` : null,
      ...room.style_tags.map((t) => `style:${normalizeTag(t)}`),
      ...room.dominant_colors.map((c) => `color:${normalizeTag(c)}`),
    ].filter((x): x is string => Boolean(x)),
  );

  const scored = products.map((product) => {
    const matchReasons: string[] = [];
    let matchScore = 0;

    for (const rawTag of product.tags) {
      const tag = normalizeTag(rawTag);
      if (roomSignals.has(tag)) {
        matchScore += tag.startsWith("room:") ? 2 : 1; // room-type match weighted highest
        matchReasons.push(tag);
      }
    }

    return { ...product, matchScore, matchReasons };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}
