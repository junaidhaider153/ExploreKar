// Thin wrapper around the Gemini Vision REST API. Server-only: never call this
// from a Client Component, since it uses GEMINI_API_KEY.

export type RoomAnalysisResult = {
  room_type: string | null;
  style_tags: string[];
  dominant_colors: string[];
  color_palette?: string[];
  notes: string;
};

const FALLBACK: RoomAnalysisResult = {
  room_type: "living-room",
  style_tags: ["minimal", "warm-neutral", "modern"],
  dominant_colors: ["warm-neutral", "light-wood", "cream"],
  color_palette: ["#f5f6f0", "#d48b32", "#384733"],
  notes: "A balanced contemporary space with soft natural lighting and neutral interior tones.",
};

const PROMPT = `You are an expert architectural interior designer analyzing a room photo.
Analyze the room's architecture, existing furniture, floor material, wall tone, and ambient lighting.
Respond with ONLY a valid, compact JSON object (no markdown code blocks, no backticks, no introductory text), matching exactly this shape:
{
  "room_type": one of "living-room" | "bedroom" | "office" | "dining-room" | "kitchen" | "other",
  "style_tags": array of 2-4 short lowercase style keywords (e.g. "minimal", "mid-century", "earthy", "scandinavian", "industrial", "modern", "bohemian"),
  "dominant_colors": array of 2-4 short lowercase color keywords (e.g. "warm-neutral", "light-wood", "terracotta", "charcoal", "gold", "cream", "white", "black"),
  "color_palette": array of 3 distinct hex color codes detected in the space (e.g. ["#e8ebe0", "#c9862c", "#2d4030"]),
  "notes": one concise sentence (max 20 words) giving an inspiring design critique of the room's current atmosphere
}`;

export async function analyzeRoomPhoto(imageBase64: string, mimeType: string): Promise<RoomAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return FALLBACK;

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`Gemini Vision API returned ${res.status}: ${body.slice(0, 200)} — falling back`);
      return FALLBACK;
    }

    const data = await res.json();
    const rawText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return FALLBACK;

    // Clean any accidental markdown fences
    const cleanJson = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed: Partial<RoomAnalysisResult> = JSON.parse(cleanJson);

    return {
      room_type: typeof parsed.room_type === "string" ? parsed.room_type : "living-room",
      style_tags: Array.isArray(parsed.style_tags) && parsed.style_tags.length > 0
        ? parsed.style_tags.slice(0, 4)
        : ["minimal", "modern"],
      dominant_colors: Array.isArray(parsed.dominant_colors) && parsed.dominant_colors.length > 0
        ? parsed.dominant_colors.slice(0, 4)
        : ["warm-neutral", "light-wood"],
      color_palette: Array.isArray(parsed.color_palette)
        ? parsed.color_palette.slice(0, 3)
        : ["#eef0e6", "#c9862c", "#384733"],
      notes: typeof parsed.notes === "string" && parsed.notes.length > 0
        ? parsed.notes
        : "A spacious room ready for curated furniture accents.",
    };
  } catch (err) {
    console.error("Gemini Vision processing error:", err);
    return FALLBACK;
  }
}
