import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreProducts } from "@/lib/recommend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");
  if (!roomId) return NextResponse.json({ error: "Missing roomId" }, { status: 400 });

  const supabase = createClient();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("room_type, style_tags, dominant_colors")
    .eq("id", roomId)
    .single();
  if (roomError || !room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, slug, title, price_cents, currency, primary_image_path, tags")
    .eq("is_active", true);
  if (productsError) return NextResponse.json({ error: productsError.message }, { status: 500 });

  const ranked = scoreProducts(products ?? [], {
    room_type: room.room_type,
    style_tags: room.style_tags ?? [],
    dominant_colors: room.dominant_colors ?? [],
  });

  return NextResponse.json({ products: ranked.slice(0, 12) });
}
