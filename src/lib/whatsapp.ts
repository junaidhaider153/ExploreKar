import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE_PREFIX } from "@/lib/site";
import { formatPrice } from "@/lib/format";

export interface WhatsAppProduct {
  title: string;
  price_cents: number;
  currency: string;
  slug: string;
}

/**
 * Builds a wa.me URL with a pre-filled inquiry message for a given product.
 */
export function buildWhatsAppUrl(product: WhatsAppProduct): string {
  const priceFormatted = formatPrice(product.price_cents, product.currency);
  const productUrl = `https://explorekar.com/catalog/${product.slug}`;

  const message = [
    WHATSAPP_MESSAGE_PREFIX,
    ``,
    `🛋️ *Product:* ${product.title}`,
    `💰 *Price:* ${priceFormatted}`,
    `🔗 *Link:* ${productUrl}`,
    ``,
    `Could you please confirm availability and delivery details? Thank you!`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
