import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE_PREFIX, siteUrl } from "@/lib/site";
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
  // Was hardcoded to "https://explorekar.com" regardless of the actual
  // deployment — wrong on localhost, wrong on a preview deploy, wrong if
  // the real domain is ever different from that placeholder.
  const productUrl = `${siteUrl}/catalog/${product.slug}`;

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

export interface WhatsAppOrderItem {
  title: string;
  price_cents: number;
  currency: string;
  quantity: number;
}

export interface WhatsAppOrder {
  id: string;
  items: WhatsAppOrderItem[];
  subtotal_cents: number;
  currency: string;
  guest_name: string;
}

/**
 * Builds a wa.me URL summarizing a placed order, for the confirmation page.
 * There's no live payment integration yet, so this message is how the
 * customer actually reaches the merchant to arrange payment and delivery —
 * it's the real "complete checkout" step for now, not a courtesy follow-up.
 */
export function buildOrderWhatsAppUrl(order: WhatsAppOrder): string {
  const orderUrl = `${siteUrl}/order/${order.id}/confirmation`;
  const shortId = order.id.slice(0, 8).toUpperCase();

  const itemLines = order.items.map(
    (item) =>
      `• ${item.title} × ${item.quantity} — ${formatPrice(item.price_cents * item.quantity, item.currency)}`,
  );

  const message = [
    `Hi! I just placed an order on Explore Kar.`,
    ``,
    `🧾 *Order:* #${shortId}`,
    `👤 *Name:* ${order.guest_name}`,
    ``,
    ...itemLines,
    ``,
    `💰 *Total:* ${formatPrice(order.subtotal_cents, order.currency)}`,
    `🔗 *Order link:* ${orderUrl}`,
    ``,
    `Could you confirm payment details and delivery timeline? Thank you!`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
