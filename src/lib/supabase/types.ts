export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Supplying `any` as the generic Database param prevents @supabase/supabase-js 2.116+
// internal Postgrest schema parser from breaking on ungenerated client-side schemas,
// while providing complete, strict types below for all rows and tables.
export type Database = any;

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  room_tags: string[];
};

export type ProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  category_id: string | null;
  tags: string[];
  width_cm: number | null;
  height_cm: number | null;
  depth_cm: number | null;
  primary_image_path: string;
  is_active: boolean;
  created_at: string;
};

export type RoomRow = {
  id: string;
  user_id: string;
  image_path: string;
  room_type: string | null;
  style_tags: string[];
  dominant_colors: string[];
  analysis_raw: Json | null;
  analysis_status: "pending" | "done" | "failed";
  created_at: string;
};

export type RoomPlacementRow = {
  id: string;
  room_id: string;
  product_id: string;
  x: number;
  y: number;
  scale: number;
  rotation_deg: number;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type WishlistRow = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};
