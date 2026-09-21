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

ADMIN_EMAILS=you@example.com
```

### 4. Database Setup
1. In your Supabase project dashboard, navigate to the **SQL Editor**.
2. Run `supabase/schema.sql` (creates `categories`, `products`, `rooms`, `room_analyses`, `placements`, and storage buckets).
3. Run `supabase/wishlists-migration.sql` (creates `wishlists` table with RLS).
4. Run `supabase/rate-limit-migration.sql` (creates `api_rate_limit_events` — required for `/api/analyze-room` to work; without this table the route's rate-limit check will error).
5. Run `supabase/orders-migration.sql` (creates `orders` and `order_items` — required for cart/checkout to work).
6. If you're upgrading an existing project created before this Phase 0 pass, also run `supabase/room-placements-product-id-migration.sql` (relaxes `room_placements.product_id` from a strict FK to TEXT — fresh projects get this directly from `schema.sql` already).
7. (Optional) Run the seed script to populate sample catalog items:
```bash
npm run seed
```

### 5. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Admin Access
Product management lives at `/admin` — add/edit/hide/delete products with
image upload, instead of hand-editing Supabase rows or relying on the
curated fallback catalog.

1. Set `ADMIN_EMAILS=you@example.com,teammate@example.com` (comma-separated,
   already in `.env.local` if you filled in step 3).
2. Sign up/in with one of those emails.
3. An "Admin" link appears in the nav for any signed-in user — but access is
   actually enforced server-side by `requireAdmin()` in `src/lib/admin.ts`,
   checked at the top of every admin page and Server Action. A signed-in
   user whose email isn't in `ADMIN_EMAILS` is redirected, not granted
   access, regardless of the nav link being visible to them.

### 7. Cart & Checkout
There's no live payment integration yet, so checkout works like this:

1. Add items to the cart (kept client-side in `localStorage`, no account
   needed — see `src/lib/useCart.ts`).
2. Checkout collects name, email, phone, and delivery address (guest
   checkout is fully supported; a signed-in user's email is prefilled but an
   account is never required).
3. Submitting creates an `orders` row + `order_items` rows via a Server
   Action (`src/app/checkout/actions.ts`), which recomputes the total
   server-side rather than trusting whatever the client sent.
4. The confirmation page gives the customer a pre-filled WhatsApp message
   summarizing the order — that message is currently the actual "complete
   my purchase" step, since there's no live payment gateway wired up.
5. Admins see and manage every order at `/admin/orders`, including updating
   its status (`pending` → `contacted` → `confirmed` → `fulfilled`, or
   `cancelled`).

When a real payment gateway is added later (PayFast is the natural choice,
matching FikarNot), it slots in between steps 3 and 4 without changing the
cart or admin pieces.

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
