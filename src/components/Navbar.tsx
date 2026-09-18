"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Grid, Menu, X, User as UserIcon, LogOut, ArrowRight, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/catalog", label: "Catalog", icon: Grid },
    { href: "/room", label: "AI Visualizer", icon: Camera },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "glass-nav shadow-elevation py-3"
          : "bg-paper/80 backdrop-blur-md border-b border-line/60 py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-flash transition-transform duration-300 group-hover:scale-105">
            <span className="absolute -top-1 -left-1 h-2 w-2 border-t-2 border-l-2 border-brass" />
            <span className="absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2 border-brass" />
            <Camera className="h-4 w-4 text-brass" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              Explore<span className="text-brass">Kar</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-ink-muted -mt-1 font-mono">
              Spatial Design
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 rounded-full border border-line bg-paper-light/90 px-3 py-1.5 shadow-sm">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-ink text-flash shadow-sm"
                    : "text-ink-soft hover:text-ink hover:bg-paper-dark/60"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-brass" : "text-ink-muted"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side CTA & Auth */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/room"
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-display text-xs font-semibold text-flash hover:bg-moss transition-colors shadow-sm"
          >
            <span>Scan Your Room</span>
            <ArrowRight className="h-3.5 w-3.5 text-brass" />
          </Link>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-line">
              <Link
                href="/account/saved"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-soft hover:text-ink hover:bg-paper-dark/60 transition-colors"
                title="Saved Looks"
              >
                <Heart className="h-3.5 w-3.5 text-terracotta" />
                <span>Saved</span>
              </Link>
              <div className="flex items-center gap-2 text-xs font-medium text-ink-soft">
                <div className="h-7 w-7 rounded-full bg-moss-light border border-moss/30 flex items-center justify-center text-moss font-semibold">
                  {user.email?.charAt(0).toUpperCase() || <UserIcon className="h-3.5 w-3.5" />}
                </div>
              </div>
              <form action="/auth/sign-out" method="post">
                <button
                  type="submit"
                  className="rounded-full p-2 text-ink-muted hover:text-terracotta hover:bg-paper-dark transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-line bg-paper-light px-4 py-2 text-xs font-semibold text-ink hover:border-ink/40 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden rounded-lg p-2 text-ink hover:bg-paper-dark transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-x-0 border-t border-b border-line mt-3 px-6 py-6 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? "bg-ink text-flash" : "text-ink hover:bg-paper-dark"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-brass" : "text-ink-muted"}`} />
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-line flex flex-col gap-2">
              <Link
                href="/room"
                className="flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 font-display text-sm font-semibold text-flash"
              >
                <Camera className="h-4 w-4 text-brass" />
                Scan Your Room
              </Link>

              {user ? (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/account/saved"
                    className="flex items-center gap-2 rounded-xl border border-line bg-paper-light px-4 py-2.5 text-sm font-medium text-ink hover:border-terracotta/40 transition-colors"
                  >
                    <Heart className="h-4 w-4 text-terracotta" />
                    Saved Looks & Wishlist
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ink-muted truncate max-w-[200px]">
                      {user.email}
                    </span>
                    <form action="/auth/sign-out" method="post">
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-terracotta hover:bg-terracotta-light"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-xl border border-line bg-paper-light py-2.5 text-sm font-medium text-ink"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
