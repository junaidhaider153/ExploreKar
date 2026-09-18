-- ─── wishlists table ─────────────────────────────────────────────────────────
-- Run this in your Supabase SQL Editor to create the wishlists table.
-- This enables authenticated users to save their favourite products.

CREATE TABLE IF NOT EXISTS public.wishlists (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL,                -- Can be a UUID (from products table) or a slug
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Each user can wishlist a specific product only once
  CONSTRAINT wishlists_user_product_unique UNIQUE (user_id, product_id)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Users can read only their own wishlist rows
CREATE POLICY "Users can read their own wishlist"
  ON public.wishlists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own wishlist rows
CREATE POLICY "Users can add to their wishlist"
  ON public.wishlists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own wishlist rows
CREATE POLICY "Users can remove from their wishlist"
  ON public.wishlists
  FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Index for fast lookups ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON public.wishlists (user_id);
CREATE INDEX IF NOT EXISTS wishlists_product_id_idx ON public.wishlists (product_id);
