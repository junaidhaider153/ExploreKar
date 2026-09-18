export interface DemoRoom {
  id: string;
  title: string;
  subtitle: string;
  roomType: string;
  styleTags: string[];
  dominantColors: string[];
  notes: string;
  photoUrl: string;
  suggestedProductSlug: string;
}

export const DEMO_ROOMS: DemoRoom[] = [
  {
    id: "demo-living-room",
    title: "Sunlit Architectural Living Room",
    subtitle: "Warm neutral oak flooring, high ceilings, large windows",
    roomType: "living-room",
    styleTags: ["minimal", "mid-century", "earthy"],
    dominantColors: ["warm-neutral", "light-wood", "cream"],
    notes: "A bright living space with clean architectural lines and warm natural lighting.",
    photoUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    suggestedProductSlug: "walnut-coffee-table",
  },
  {
    id: "demo-bedroom",
    title: "Nordic Minimalist Bedroom",
    subtitle: "Soft muted textures, terracotta accents, serene atmosphere",
    roomType: "bedroom",
    styleTags: ["minimal", "scandinavian", "earthy"],
    dominantColors: ["terracotta", "light-wood", "white"],
    notes: "A calm, airy bedroom featuring soft earth tones and uncluttered surfaces.",
    photoUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
    suggestedProductSlug: "linen-lounge-chair",
  },
  {
    id: "demo-office",
    title: "Modern Executive Home Office",
    subtitle: "Dark wood credenza, gallery wall, focused work ambient",
    roomType: "office",
    styleTags: ["mid-century", "industrial", "minimal"],
    dominantColors: ["charcoal", "dark-wood", "gold"],
    notes: "A focused studio work room with rich wood finishes and warm metallic highlights.",
    photoUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    suggestedProductSlug: "oak-bookshelf",
  },
];
