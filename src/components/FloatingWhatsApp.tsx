"use client";

import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE_PREFIX } from "@/lib/site";

/**
 * Site-wide WhatsApp inquiry entry point. Previously the only WhatsApp CTA
 * lived inside ProductDetailClient, so anyone browsing the catalog, the
 * homepage, or a room visualization had no inquiry path at all — the PDP's
 * button is a real answer for "I'm looking at this specific product", but
 * there was nothing for everywhere else.
 *
 * Positioned bottom-left deliberately: Toast.tsx's notification container is
 * pinned bottom-6 right-6, and a second fixed element in the same corner
 * would visually collide the moment a toast fires while this is visible.
 */
export function FloatingWhatsApp() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE_PREFIX)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elevation transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100"
      style={{
        // Keep clear of a phone's home-indicator bar / gesture area rather
        // than sitting flush against the raw viewport edge.
        bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M11.973 0C5.362 0 0 5.362 0 11.973c0 2.092.542 4.06 1.49 5.773L.054 23.267a.5.5 0 0 0 .617.617l5.568-1.422A11.928 11.928 0 0 0 11.973 24C18.584 24 24 18.638 24 12.027 24 5.362 18.584 0 11.973 0zm0 21.818a9.762 9.762 0 0 1-5.014-1.38l-.36-.213-3.724.952.974-3.664-.234-.375a9.74 9.74 0 0 1-1.459-5.165c0-5.393 4.39-9.783 9.817-9.783 5.393 0 9.817 4.39 9.817 9.783 0 5.394-4.424 9.845-9.817 9.845z" />
      </svg>
    </a>
  );
}
