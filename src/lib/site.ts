// Single source of truth for the app's absolute base URL.
//
// This was previously duplicated in three separate files (layout.tsx,
// robots.ts, sitemap.ts) each with a bare `|| "http://localhost:3000"`
// fallback — and a fourth spot (the signup email redirect) had no fallback
// at all. If NEXT_PUBLIC_SITE_URL isn't set on Vercel, that combination
// silently ships a sitemap and OG images pointing at localhost, and turns
// signup confirmation emails into a literal "undefined/auth/confirm" link.
// One helper, with a smarter fallback chain, closes all four holes at once.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  // VERCEL_URL is auto-injected by Vercel on every preview/prod deploy —
  // a much safer fallback than localhost if the env var was forgotten.
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000"
).replace(/\/+$/, ""); // strip any trailing slash so callers can safely do `${siteUrl}/path`

// ─── WhatsApp Order Inquiry ───────────────────────────────────────────────────
// Business WhatsApp number (country code without + prefix).
// Can be set via NEXT_PUBLIC_WHATSAPP_NUMBER in .env / Vercel dashboard.
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567";

export const WHATSAPP_MESSAGE_PREFIX =
  "Hi! I found this piece on ExploreKar and I'm interested in ordering it.";
