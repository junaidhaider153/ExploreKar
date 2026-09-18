import Link from "next/link";
import { Camera, Sparkles, ShieldCheck, Truck, RotateCcw, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper-light mt-20">
      {/* Guarantees / Value Pillars Bar */}
      <div className="border-b border-line bg-flash py-8">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-brass-light text-brass flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink font-display">AI Spatial Matching</h4>
              <p className="text-xs text-ink-muted">Vision algorithms tuned to your lighting, colors & style</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-moss-light text-moss flex items-center justify-center shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink font-display">2D Room Studio</h4>
              <p className="text-xs text-ink-muted">Drag, resize, and compose real pieces before you buy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-paper-dark text-ink flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink font-display">Nationwide Delivery</h4>
              <p className="text-xs text-ink-muted">Curated decor & handcrafted furniture across Pakistan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand column */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-flash">
              <Camera className="h-4 w-4 text-brass" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              Explore<span className="text-brass">Kar</span>
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-ink-muted">
            The next generation of interior shopping. Photograph your living space, let Gemini AI analyze your style, and preview handcrafted furniture directly in your room.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-[11px] font-mono text-moss border border-line">
              <span className="h-1.5 w-1.5 rounded-full bg-moss animate-pulse" />
              v1.0 AI Interior Engine
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-ink">
            Explore
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs text-ink-soft">
            <li>
              <Link href="/catalog" className="hover:text-ink transition-colors">
                Browse Full Catalog
              </Link>
            </li>
            <li>
              <Link href="/room" className="hover:text-ink transition-colors flex items-center gap-1">
                Scan Your Room
                <ArrowUpRight className="h-3 w-3 text-brass" />
              </Link>
            </li>
            <li>
              <Link href="/catalog?category=seating" className="hover:text-ink transition-colors">
                Lounge Chairs & Seating
              </Link>
            </li>
            <li>
              <Link href="/catalog?category=tables" className="hover:text-ink transition-colors">
                Coffee & Dining Tables
              </Link>
            </li>
            <li>
              <Link href="/catalog?category=lighting" className="hover:text-ink transition-colors">
                Arc & Pendant Lighting
              </Link>
            </li>
          </ul>
        </div>

        {/* Technology & Design */}
        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-ink">
            Technology
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs text-ink-soft">
            <li>
              <span className="text-ink-muted">Gemini 2.0 Multimodal Vision</span>
            </li>
            <li>
              <span className="text-ink-muted">Dynamic Tag Overlap Matcher</span>
            </li>
            <li>
              <span className="text-ink-muted">2D Resolution-Independent Canvas</span>
            </li>
            <li>
              <span className="text-ink-muted">Supabase Storage RLS Protection</span>
            </li>
          </ul>
        </div>

        {/* Contact / Help */}
        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-ink">
            Support & Orders
          </h3>
          <p className="mt-4 text-xs leading-relaxed text-ink-muted">
            Have custom dimension requests or questions about furniture delivery?
          </p>
          <div className="mt-3">
            <a
              href="mailto:support@explorekar.com"
              className="inline-block text-xs font-medium text-ink underline underline-offset-4 hover:text-brass transition-colors"
            >
              support@explorekar.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line bg-paper py-6">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <p>© {new Date().getFullYear()} ExploreKar. All rights reserved.</p>
          <p className="text-[11px]">
            Designed for intuitive home furnishing in Pakistan and beyond.
          </p>
        </div>
      </div>
    </footer>
  );
}
