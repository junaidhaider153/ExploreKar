# ExploreKar — AI Spatial Furniture Matching & Room Visualizer

**ExploreKar** is an AI-powered interior visualizer and curated furniture shopping experience. Upload a photo of your living space, let Gemini AI analyze your style and colors, and interactively preview handcrafted furniture and decor inside your actual room before you purchase.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Google Gemini AI**, and **Supabase**.

---

## Key Features

- **AI Room Vision Analysis**: Upload a room photo; Google Gemini AI identifies room type (Living Room, Bedroom, Dining, Studio), aesthetic style (Mid-Century Modern, Minimalist, Japandi, Industrial, Boho), and dominant color palettes.
- **Guest & Authenticated Mode**: Full room visualizer capability for guests (via browser memory/client state) with seamless account sign-up and persistence.
- **Multi-Item Interactive Studio**: Drag, resize, rotate, and layer multiple furniture pieces onto your room photo. Download or save your custom design snapshots.
- **Curated Furniture Catalog**: Category filters (Seating, Tables, Lighting, Storage, Decor, Rugs), dimensions in centimeters, and instant search.
- **Dual-Storage Wishlist**: Save favorite items with instant optimistic UI. Stored in `localStorage` for guests and synced to Supabase `wishlists` for logged-in users.
- **WhatsApp Order Inquiry**: One-click direct order inquiry via WhatsApp (`wa.me`) with pre-filled product name, price, and link.
- **Saved Looks Dashboard (`/account/saved`)**: Personal portal for logged-in users to revisit and reopen their room designs and manage wishlists.
- **SEO & Social Sharing**: Complete Open Graph & Twitter cards, dynamic XML sitemap, `robots.txt`, and Google JSON-LD structured data (`WebSite`, `Organization`, `Product`, `BreadcrumbList`).
- **Production Hardened**: HTTP security headers, branded SVG favicon, Web App Manifest, accessible skip links, and zero type errors.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design tokens (`paper`, `ink`, `brass`, `moss`, `terracotta`)
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`)
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security & Supabase Auth)
- **Icons**: Lucide React
- **Typography**: Plus Jakarta Sans (Display) & Inter (Body) via `next/font/google`

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18.17+ or 20+
- A free Supabase project from [supabase.com](https://supabase.com)
- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd explore-kar
npm install
```

### 3. Setup Environment Variables
Create `.env.local` based on `.env.example`:
```bash
cp .env.example .env.local
```
Fill in:
```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=923001234567
```

### 4. Database Setup
1. In your Supabase project dashboard, navigate to the **SQL Editor**.
2. Run `supabase/schema.sql` (creates `categories`, `products`, `rooms`, `room_analyses`, `placements`, and storage buckets).
3. Run `supabase/wishlists-migration.sql` (creates `wishlists` table with RLS).
4. (Optional) Run the seed script to populate sample catalog items:
```bash
npm run seed
```

### 5. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Production Build & Quality Checks

Run the automated verification suite:

```bash
# Type check without emitting files
npx tsc --noEmit

# Production build
npm run build
```

---

## Deployment (Vercel)

1. Push this repository to GitHub or GitLab.
2. Import the repository into [Vercel](https://vercel.com).
3. Add the environment variables from `.env.local` to **Project Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g., `https://explorekar.com`).
5. In your Supabase Dashboard under **Authentication → URL Configuration**, add:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/confirm` and `https://your-domain.com/account/saved`
6. Deploy!

---

## License

Private project. All rights reserved.
