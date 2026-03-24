import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

export const dynamic = "force-static";

const localizedPaths = ["", "/offline", "/privacy-policy", "/terms-of-service"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.tgatb.click";
  const now = new Date();

  return routing.locales.flatMap((locale) => {
    const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;

    return localizedPaths.map((path) => ({
      url: `${baseUrl}${localePrefix}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.7,
    }));
  });
}