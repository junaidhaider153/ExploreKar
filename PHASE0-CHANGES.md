# Phase 0 Fixes — Audit Follow-up

Verified and fixed against the code (not just the audit document) on this pass.
Each item was confirmed by reading the actual failing code before being changed.

## Critical

- **`/api/analyze-room` was fully open and unlimited.** The guest
  (`imageBase64`) branch had no auth check and no rate limit at all; the
  authenticated branch had lost its rate limit somewhere along the way too.
  Fixed with a DB-backed limiter (`src/lib/rate-limit.ts`,
  `supabase/rate-limit-migration.sql`) — 8/hour by IP for guests, 15/hour by
  user for authenticated requests. DB-backed rather than in-memory because
  this runs on Vercel serverless functions, which don't share memory between
  invocations (the same reasoning behind FikarNot's own
  `server/lib/rateLimit.js`).

## High

- **`saveRoomLook` reported success even when the write failed.** The
  underlying cause: `room_placements.product_id` was a strict FK to
  `products(id)`, so curated/demo items (which have no DB row) could never
  actually be saved — and the code never checked the upsert's returned
  error, so it showed "saved!" regardless. Fixed the root cause (relaxed the
  column to TEXT, no FK — the same trade-off already made for
  `wishlists.product_id`) and the symptom (now checks every result and
  reports full/partial/failed accurately).
- **The AI's one-line room summary was fetched but never shown.** The query
  aliased the *entire* `analysis_raw` JSON column as `notes`
  (`notes:analysis_raw`), which isn't how you extract one field with
  PostgREST — even if rendered, it would have printed `[object Object]`.
  Fixed to select `analysis_raw` directly and read `.notes` off it in JS.
- **Only one saved item ever restored**, even when several had been placed
  and saved. The results page only ever fetched/restored a placement for the
  single "featured" product. Now fetches every `room_placements` row for the
  room and hydrates the full multi-item canvas from it.
- **The first placed item always showed a hardcoded Rs. 45,000**, regardless
  of the actual product. Replaced with the real `price_cents`/`currency`
  from the matched product everywhere an item is constructed.
- **JSON-LD injection was exploitable, not just untidy.** `product.title`/
  `description` (DB-editable) were serialized with plain `JSON.stringify`
  into a `<script type="application/ld+json">` tag. A value containing the
  literal text `</script>` would terminate the tag early and let following
  content execute as HTML/script — a known, named class of vulnerability.
  Added `src/lib/json-ld.ts`'s `safeJsonLd()` (escapes `<`) and applied it
  everywhere `dangerouslySetInnerHTML` injects JSON-LD.

## Medium

- **Guest wishlist never merged into the account on login** — signing in
  just discarded whatever was in the guest's localStorage wishlist. Now
  merged (best-effort upsert, ignoring duplicates) the first time
  `useWishlist` loads for a signed-in user.
- **A missing `GEMINI_API_KEY` returned an identical, fully-populated fake
  analysis for every single user**, indistinguishable from a real read of
  their photo. `analyzeRoomPhoto`'s fallback now carries `is_fallback: true`,
  and the results page shows an honest "AI analysis unavailable" message
  instead of presenting it as personalized.
- **Silent DB-failure catch blocks** in `catalog/page.tsx`,
  `catalog/[slug]/page.tsx`, and `sitemap.ts` now log via `console.error`
  before falling back to curated data — a real Supabase outage previously
  looked identical to "no products seeded yet," with nothing in the logs to
  tell them apart.
- **`toggleWishlist` had the same silent-failure pattern as
  `saveRoomLook`** — optimistic UI update, no check on the actual
  insert/delete result. Now reverts the optimistic update and logs on
  failure.

## Bonus, while already in these files

- Parallelized the results page's Supabase calls (room + products fetched
  together, then signed photo URL + placements together) instead of four
  sequential round trips.
- Guest "Save Room Look" was write-only — `saveRoomLook` wrote to
  `localStorage.explorekar_saved_look` but nothing ever read it back on any
  page. The guest results page now restores it on load.
- Removed a couple of `any`/`as any` casts introduced since the last review
  pass (`RoomPreviewCanvas`'s `availableProducts`, the results page's
  `imageUrl` access) by giving `recommend.ts`'s `Product` type an optional
  `imageUrl` field and adding a proper `CuratedLikeProduct` type — these
  casts were part of why `tsc` didn't catch some of the bugs above on its
  own.

## Not done in this pass (tracked, not forgotten)

These are real and worth doing, but are Phase 1+ per the roadmap discussion,
not "actively broken":

- Splitting the cookie-bound vs. anonymous/cacheable Supabase client so
  `export const revalidate = 60` on the catalog actually takes effect
  (currently overridden by dynamic rendering on any page using the
  cookie-bound client).
- Floating WhatsApp button on non-product pages.
- Moving curated catalog images off hotlinked Unsplash URLs into Supabase
  Storage.
- Re-adding the admin product-management module (built in an earlier
  session, not present in this codebase snapshot).
- Cart/checkout/payments/orders — the actual gap between "AI visualizer
  prototype" and "a store like FikarNot."
