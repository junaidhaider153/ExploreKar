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

- Moving curated catalog images off hotlinked Unsplash URLs into Supabase
  Storage.
- Re-adding the admin product-management module (built in an earlier
  session, not present in this codebase snapshot).
- Cart/checkout/payments/orders — the actual gap between "AI visualizer
  prototype" and "a store like FikarNot."

---

## Round 2 — Caching Fix + Floating WhatsApp

- **Split the cookie-bound vs. anonymous/cacheable Supabase client** — the
  "highest-leverage single fix" from the performance diagnosis. Any Server
  Component calling `cookies()` (which the cookie-bound `createClient()`
  does, to read the session) forces that entire route into fully dynamic
  rendering, silently overriding `export const revalidate = 60` with no
  error or warning. The catalog listing, product detail, and sitemap never
  actually needed the user's session — they're public reads — so they now
  use a new `createPublicClient()` (`src/lib/supabase/public.ts`) that never
  touches cookies. Confirmed with an actual build: `/catalog` and
  `/sitemap.xml` flipped from `ƒ` (Dynamic, full round trip every request)
  to `○` (Static/ISR). Added a matching `revalidate = 60` to the product
  detail page, which never had one before — it would have been dead code
  under the old client anyway.
- **Floating WhatsApp button** (`src/components/FloatingWhatsApp.tsx`),
  mounted once in the root layout so every page has an inquiry path, not
  just the product detail page. Deliberately placed bottom-**left** since
  `Toast.tsx`'s notifications are pinned bottom-right — the two would
  otherwise collide the first time a toast fires while the button is
  visible. Respects `prefers-reduced-motion` and clears the mobile
  safe-area inset instead of sitting flush against the raw viewport edge.

## Still not done (Phase 1+)

- Moving curated catalog images off hotlinked Unsplash URLs into Supabase
  Storage — genuinely blocked on having real product photography to upload,
  not a code gap. The admin module gives you somewhere to upload it once it
  exists.
- Cart/checkout/payments/orders — the actual gap between "AI visualizer
  prototype" and "a store like FikarNot."

---

## Round 3 — Admin Module Re-added

The product-management admin panel (built in an earlier session, absent
from this codebase snapshot per the feature-comparison table) is back at
`/admin`:

- Add / edit / hide / delete products, with image upload straight into the
  `product-images` Storage bucket.
- Gated by `requireAdmin()` — an email allowlist (`ADMIN_EMAILS` env var)
  checked server-side at the top of every admin Server Component and Server
  Action. This is the actual access control; the "Admin" nav link itself is
  shown to any signed-in user (the client-side Navbar can't read a
  server-only env var to hide it more precisely), and a non-admin who clicks
  it is redirected, not granted access.
- Verified against this codebase's actual `products`/`categories` schema
  (checked by hand, not assumed) — the schema turned out to be unchanged
  from when this module was originally built, so it ported over with zero
  schema-shape changes needed.
- Image uploads are validated server-side (JPEG/PNG/WebP only, 5MB cap, a
  fixed extension set) rather than trusting the `accept="image/*"` HTML
  attribute — that's a UX hint, not a security control, and this endpoint
  is reachable by a raw request from anyone holding valid admin cookies.
- `saveProduct`/`toggleActive`/`deleteProduct` call `revalidatePath` on the
  affected catalog pages, so an edit shows up immediately instead of waiting
  out the `revalidate = 60` ISR window — relevant now that catalog/product
  pages are actually cached (Round 2's fix).
- Added the `ShieldCheck` nav link to both the desktop and mobile Navbar,
  matching this codebase's actual (client-component, redesigned) Navbar
  rather than reintroducing the old server-component version wholesale.

---

## Round 4 — Homepage & Nav Restructure

Per Section 3 of the improvement plan: the architecture already supported
browsing independently of the AI visualizer — what was AI-first was the
*framing*, not the code. Changed the framing, not the data layer:

- **Nav**: "Catalog" → "Shop", both nav items ("Shop" and "Room Visualizer")
  are equal-weight pills, as they already structurally were. Removed the
  extra always-visible "Scan Your Room" CTA button that sat beside those
  pills on both desktop and mobile — that button, on top of Room Visualizer
  already having its own nav link, was the actual source of "the whole site
  funnels toward AI," not the nav structure itself.
- **Homepage hero**: primary CTA is now "Shop the Collection"; the room
  visualizer is a secondary link labeled "New: preview any piece in your
  room" rather than the hero's only path. The hero's image mosaic now shows
  featured *products* (linking to their product pages) instead of AI demo
  rooms.
- **The old "How It Works" section** (previously the first thing after the
  hero, implicitly presenting the AI flow as the site's core identity) is
  now clearly labeled "New Feature" further down the page, with the demo
  rooms mosaic folded into it — one section instead of a hero teaser plus a
  separate mobile-only demo strip.
- **Final CTA** now offers "Shop the Collection" and "Preview a piece in
  your room" as two genuinely equal options, rather than a brass primary
  button for AI and a muted outline link for the catalog.
- Product detail pages needed no changes — the plan had already confirmed
  "Preview in Your Room" sitting alongside "Inquire via WhatsApp" as one
  option among several there, not a gate.

## Still not done

- Cart/checkout/payments/orders — the only item left on the original
  feature-comparison table, and the actual gap between "AI visualizer
  prototype" and "a store like FikarNot." Deliberately not started without
  first agreeing the architecture (guest checkout vs. accounts-only, PayFast
  sandbox vs. live keys, whether orders need admin visibility) — this one's
  too consequential and too large to guess at.

---

## Round 5 — Cart, Checkout, Orders, Admin Order Management

The last item on the original feature-comparison table. Scoped deliberately
against your three answers: guest checkout allowed, no live payment yet
(WhatsApp inquiry stays the completion step), admin gets an orders view now.

- **Cart** (`src/lib/useCart.ts`): client-side only, localStorage-backed, no
  new DB table. Deliberately not built like the wishlist's DB-synced,
  merge-on-login pattern — there's no live payment yet, so a cart's whole
  lifecycle is "build it up, submit it wholesale at checkout." If "save my
  cart across devices" becomes a real request later, promote this to a
  DB-backed table the same way wishlists already work; the hook's interface
  wouldn't need to change for callers.
- **`orders` / `order_items` tables** (`supabase/orders-migration.sql`):
  guest checkout means `orders.user_id` is nullable; `order_items.product_id`
  is TEXT with no FK (same trade-off as `wishlists`/`room_placements`, since
  an order can contain curated/demo items with no row in `products`); item
  title/price/currency are snapshotted at order time rather than looked up
  live, so an order reflects what was actually bought even if a price or the
  curated catalog changes later.
- **No public RLS policies on orders** — orders contain PII (name, email,
  phone, address) and guests have no session to scope a policy to. Checkout
  writes and the confirmation page's read both go through the service-role
  client instead: order creation is a trusted Server Action
  (`src/app/checkout/actions.ts`), and the confirmation page
  (`/order/[id]/confirmation`) fetches by the order's exact, cryptographically
  random UUID — the same "ID as capability" pattern Stripe/Shopify use for
  guest order confirmations, not a security shortcut.
- **The order total is recomputed server-side** from each item's price ×
  quantity inside the Server Action, never trusted from the client — the
  client is exactly what someone would tamper with to submit a lower total.
- **Admin orders** at `/admin/orders` (list) and `/admin/orders/[id]`
  (detail + status update), gated by the same `requireAdmin()` as the rest
  of `/admin`.
- **"Add to Cart"** added as the primary CTA on the product detail page
  (`ProductDetailClient`) and as a quick-add icon on `ProductCard`, both
  using the product's `slug` as the identifier — matching the existing
  wishlist convention in this codebase, not introducing a second ID scheme.
- **Fixed a small latent bug while extending `whatsapp.ts`**: the per-product
  inquiry link hardcoded `https://explorekar.com` instead of using `siteUrl`
  — wrong on localhost, wrong on any preview deploy, wrong the moment the
  real domain differs from that placeholder. Added `buildOrderWhatsAppUrl`
  alongside the existing `buildWhatsAppUrl`, both now using `siteUrl`.

## Still not done

- Live payment integration (PayFast) — the natural next step once this
  cart/order flow has been used for a bit; slots in between order creation
  and the WhatsApp handoff without disrupting anything built here.
- Account-based order history (a "My Orders" page under `/account`) — the
  `user_id` is already captured on every order for a signed-in checkout, so
  this is additive whenever it's wanted, not a schema change.
