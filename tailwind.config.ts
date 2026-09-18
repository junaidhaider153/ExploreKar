import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#111614",
          soft: "#262e2a",
          muted: "#526058",
        },
        paper: {
          DEFAULT: "#f4f6ef",
          light: "#fafbf6",
          dark: "#e8ebe0",
        },
        brass: {
          DEFAULT: "#c9862c",
          hover: "#b37422",
          light: "#f7ebd9",
          glow: "rgba(201, 134, 44, 0.25)",
        },
        moss: {
          DEFAULT: "#384733",
          hover: "#2b3727",
          light: "#eaf0e8",
        },
        terracotta: {
          DEFAULT: "#c86546",
          light: "#faebe6",
        },
        line: {
          DEFAULT: "#d8ddcb",
          dark: "#c4cbaf",
        },
        flash: "#ffffff",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        viewfinder: "0 0 0 1px rgba(201, 134, 44, 0.35), 0 8px 32px -4px rgba(17, 22, 20, 0.12)",
        elevation: "0 10px 30px -5px rgba(17, 22, 20, 0.08), 0 4px 12px -2px rgba(17, 22, 20, 0.04)",
        glass: "0 8px 32px 0 rgba(17, 22, 20, 0.08)",
        floating: "0 20px 40px -10px rgba(17, 22, 20, 0.18)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
