-- Phase 0 fix: room_placements.product_id was `uuid references products(id)`,
-- which made it impossible to ever save a placement for a curated/demo
-- product (they have no row in `products`, so the insert violates the FK).
-- saveRoomLook() in RoomPreviewCanvas.tsx didn't check the returned error,
-- so this failed silently and reported "saved" anyway.
--
-- Fix: relax to TEXT with no FK, exactly like `wishlists.product_id` already
-- does (see wishlists-migration.sql's comment: "Can be a UUID (from products
-- table) or a slug"). Referential integrity for real DB products is now a
-- convention enforced in application code, not the database — the same
-- trade-off already accepted for wishlists.

ALTER TABLE public.room_placements
  DROP CONSTRAINT IF EXISTS room_placements_product_id_fkey;

ALTER TABLE public.room_placements
  ALTER COLUMN product_id TYPE TEXT USING product_id::text;

-- The existing UNIQUE (room_id, product_id) constraint and its index still
-- apply correctly to the new column type — nothing else to change.
