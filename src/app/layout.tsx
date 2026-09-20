import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import { siteUrl } from "@/lib/site";
import { safeJsonLd } from "@/lib/json-ld";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ExploreKar — AI Spatial Furniture Matching & Room Visualizer",
    template: "%s | ExploreKar",
  },
  description:
    "Upload a photo of your room, let Gemini AI analyze your space, and preview curated furniture and decor in your room before you buy.",
  keywords: [
    "furniture",
    "decor",
    "interior design",
    "AI room visualizer",
    "virtual staging",
    "spatial matching",
    "Pakistan furniture",
    "handcrafted wood",
  ],
  authors: [{ name: "ExploreKar Team" }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "ExploreKar — AI Spatial Furniture Matching & Room Visualizer",
    description: "Upload a photo of your room, get AI-matched furniture, and preview before buying.",
    siteName: "ExploreKar",
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ExploreKar — AI Spatial Furniture Matching",
    description: "See it in your room before it's in your cart.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "ExploreKar",
        description: "AI Spatial Furniture Matching & Room Visualizer",
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/catalog?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "ExploreKar",
        url: siteUrl,
        logo: `${siteUrl}/icon.svg`,
        description: "ExploreKar brings AI spatial vision to handcrafted furniture and interior decor.",
      },
    ],
  };

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      </head>
      <body className="font-body min-h-screen flex flex-col bg-paper text-ink selection:bg-brass-light selection:text-ink">
        {/* Accessible skip-to-content link for keyboard & screen reader navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-ink focus:text-flash focus:rounded-xl focus:shadow-elevation focus:outline-none focus:ring-2 focus:ring-brass text-xs font-semibold"
        >
          Skip to main content
        </a>
        <ToastProvider>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
