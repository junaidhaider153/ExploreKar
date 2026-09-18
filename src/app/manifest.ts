import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ExploreKar — AI Spatial Furniture & Room Visualizer",
    short_name: "ExploreKar",
    description:
      "Upload a photo of your room, let Gemini AI analyze your space, and preview curated furniture and decor in your room before you buy.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfcf6",
    theme_color: "#0c100e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
