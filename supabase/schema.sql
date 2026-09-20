-- Explore Kar — core schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.
-- Safe to re-run: guarded with IF NOT EXISTS / DROP POLICY IF EXISTS.

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ============================================================================
-- PROFILES  (1:1 with auth.users; created via trigger on signup)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are self-readable" on public.profiles;
create policy "profiles are self-readable" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles are self-updatable" on public.profiles;
create policy "profiles are self-updatable" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- CATALOG
-- ============================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  -- room types this category is typically relevant to, used for matching
  room_tags text[] not null default '{}'
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'PKR',
  category_id uuid references public.categories(id) on delete set null,
  -- free-form style/color/material tags used by the recommendation matcher,
  -- e.g. {"style:minimal","color:warm-neutral","material:wood","room:living-room"}
  tags text[] not null default '{}',
  -- real width/height/depth in cm — used later for scale-accurate AR (v2)
  width_cm numeric,
  height_cm numeric,
  depth_cm numeric,
  primary_image_path text not null, -- storage path in the "product-images" bucket
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_tags_idx on public.products using gin(tags);

alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "categories are publicly readable" on public.categories;
create policy "categories are publicly readable" on public.categories
  for select using (true);

drop policy if exists "active products are publicly readable" on public.products;
create policy "active products are publicly readable" on public.products
  for select using (is_active = true);

-- Writes to catalog tables go through the service-role key from an admin
-- context only (no public insert/update/delete policy is defined on purpose).

-- ============================================================================
-- ROOMS  (a user's uploaded photo + the AI's analysis of it)
-- ============================================================================
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_path text not null, -- storage path in the "room-photos" bucket (private)
  room_type text,           -- e.g. "living-room", "bedroom", "office"
  style_tags text[] not null default '{}',
  dominant_colors text[] not null default '{}',
  analysis_raw jsonb,        -- full model response, kept for debugging/reuse
  analysis_status text not null default 'pending' check (analysis_status in ('pending','done','failed')),
  created_at timestamptz not null default now()
);

create index if not exists rooms_user_idx on public.rooms(user_id);

alter table public.rooms enable row level security;

drop policy if exists "users manage their own rooms" on public.rooms;
create policy "users manage their own rooms" on public.rooms
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- SAVED PLACEMENTS  (the "preview in your room" canvas state, so it persists)
-- ============================================================================
create table if not exists public.room_placements (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  -- TEXT, not a strict FK to products(id): a placement can be for a curated/
  -- demo catalog item that has no row in `products` at all. Same trade-off
  -- already made for wishlists.product_id — see that table's comment.
  product_id text not null,
  -- normalized 0..1 canvas coordinates + transform, so it's resolution-independent
  x numeric not null default 0.5,
  y numeric not null default 0.5,
  scale numeric not null default 1,
  rotation_deg numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (room_id, product_id)
);

alter table public.room_placements enable row level security;

drop policy if exists "users manage placements on their own rooms" on public.room_placements;
create policy "users manage placements on their own rooms" on public.room_placements
  for all using (
    exists (select 1 from public.rooms r where r.id = room_id and r.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.rooms r where r.id = room_id and r.user_id = auth.uid())
  );

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('room-photos', 'room-photos', false)
  on conflict (id) do nothing;

drop policy if exists "product images are publicly readable" on storage.objects;
create policy "product images are publicly readable" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "users upload their own room photos" on storage.objects;
create policy "users upload their own room photos" on storage.objects
  for insert with check (
    bucket_id = 'room-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users read their own room photos" on storage.objects;
create policy "users read their own room photos" on storage.objects
  for select using (
    bucket_id = 'room-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete their own room photos" on storage.objects;
create policy "users delete their own room photos" on storage.objects
  for delete using (
    bucket_id = 'room-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
