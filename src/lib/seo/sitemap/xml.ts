import { SITEMAP_CACHE_CONTROL } from "@/lib/seo/sitemap/constants";
import type { SitemapUrlEntry } from "@/lib/seo/sitemap/types";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildUrlsetXml(urls: SitemapUrlEntry[]): string {
  const body = urls
    .map(
      (url) => `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n    <lastmod>${escapeXml(url.lastmod)}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export function buildSitemapIndexXml(sitemapUrls: string[], lastmodIso: string): string {
  const body = sitemapUrls
    .map(
      (loc) =>
        `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${escapeXml(lastmodIso)}</lastmod>\n  </sitemap>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>`;
}

export function xmlResponse(xml: string, status = 200): Response {
  return new Response(xml, {
    status,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": SITEMAP_CACHE_CONTROL,
    },
  });
}
