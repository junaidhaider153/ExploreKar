import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeRoomPhoto } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { roomId, imageBase64, mimeType } = body;

  // Case 1: Guest / Instant direct base64 analysis
  if (imageBase64 && typeof imageBase64 === "string") {
    try {
      const analysis = await analyzeRoomPhoto(
        imageBase64,
        mimeType || "image/webp"
      );
      return NextResponse.json({ ok: true, analysis });
    } catch (err) {
      console.error("Direct image analysis failed:", err);
      return NextResponse.json(
        { error: "AI analysis could not process this photo." },
        { status: 500 }
      );
    }
  }

  // Case 2: Authenticated user Room ID analysis
  if (!roomId || typeof roomId !== "string") {
    return NextResponse.json(
      { error: "Missing roomId or image data" },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // RLS on `rooms` already scopes this to the caller's own row.
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, image_path, user_id")
    .eq("id", roomId)
    .single();

  if (roomError || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  try {
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("room-photos")
      .download(room.image_path);

    if (downloadError || !fileBlob) {
      throw downloadError || new Error("Could not download photo from storage");
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = fileBlob.type || "image/jpeg";

    const analysis = await analyzeRoomPhoto(base64, mime);

    const { error: updateError } = await supabase
      .from("rooms")
      .update({
        room_type: analysis.room_type,
        style_tags: analysis.style_tags,
        dominant_colors: analysis.dominant_colors,
        analysis_raw: analysis,
        analysis_status: "done",
      })
      .eq("id", roomId);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, analysis });
  } catch (err) {
    await supabase
      .from("rooms")
      .update({ analysis_status: "failed" })
      .eq("id", roomId);

    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
