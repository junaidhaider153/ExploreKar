import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Room photos, cart/checkout, orders, and account pages are
        // private/user-specific — no value to a crawler and no reason to
        // invite indexing of user or order data.
        disallow: ["/room", "/account", "/admin", "/cart", "/checkout", "/order"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
