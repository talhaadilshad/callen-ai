// robots.txt — allow the marketing site, keep crawlers out of the
// auth-gated app shell and auth callback plumbing.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/analytics",
        "/agent",
        "/calls",
        "/voices",
        "/knowledge",
        "/menu",
        "/tools",
        "/integrations",
        "/whatsapp",
        "/phone-numbers",
        "/settings",
        "/users",
        "/tenants",
        "/escalations",
        "/outbound",
        "/auth/",
        "/reset-password",
        "/hero-preview",
        "/paths-preview",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
