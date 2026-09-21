-- Cart/checkout: orders + order_items.
--
-- Design notes:
-- - No live payment integration yet (WhatsApp inquiry is still how payment
--   actually gets arranged), so there's no payment_status/transaction_id
--   here — that belongs in a future migration alongside the real gateway,
--   not guessed at now.
-- - Guest checkout is allowed: user_id is nullable. Guest identity is
--   whatever they typed (guest_name/guest_email/guest_phone), not tied to
--   an account. A logged-in user's order still gets user_id set, so they
--   could see order history later even though that UI isn't built yet.
-- - order_items.product_id is TEXT with no FK, same trade-off already made
--   for wishlists.product_id and room_placements.product_id — an order can
--   contain curated/demo catalog items that have no row in `products`.
-- - Item title/price/currency are snapshotted onto order_items at order
--   time, not looked up live from `products` when displaying an order.
--   Prices change and curated items aren't even in the DB — an order must
--   reflect what was actually bought, not whatever the catalog says today.

CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name       TEXT NOT NULL,
  guest_email      TEXT NOT NULL,
  guest_phone      TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  notes            TEXT NOT NULL DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'contacted', 'confirmed', 'fulfilled', 'cancelled')),
  subtotal_cents   INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  currency         TEXT NOT NULL DEFAULT 'PKR',
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL,
  title       TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency    TEXT NOT NULL DEFAULT 'PKR',
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  image_url   TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS orders_user_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items(order_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- No public SELECT/INSERT policies are defined on purpose. Orders contain
-- PII (name, email, phone, address) and guests have no session to scope an
-- RLS policy to, so:
--   - order creation (checkout) goes through a Server Action using the
--     service-role client (src/app/checkout/actions.ts) — a trusted server
--     context, not a direct client-side insert.
--   - the confirmation page looks up one order by its exact (unguessable,
--     cryptographically random) UUID via the service-role client too — the
--     same "ID as capability" pattern Stripe/Shopify use for guest order
--     confirmations. It never lists or searches orders, only fetches by id.
--   - the admin orders list/detail also uses the service-role client,
--     gated by requireAdmin() same as the rest of /admin.
-- If account-based order history is added later, add a narrow policy like:
--   CREATE POLICY "users read their own orders" ON public.orders
--     FOR SELECT USING (auth.uid() = user_id);
