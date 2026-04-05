import { BASE_URL } from "@/lib/seo/sitemap/constants";
import { getStaticSitemapEntries } from "@/lib/seo/sitemap/data";
import { buildUrlsetXml, xmlResponse } from "@/lib/seo/sitemap/xml";

export function GET(): Response {
  try {
    const staticEntries = getStaticSitemapEntries();
    const xml = buildUrlsetXml(staticEntries);
    return xmlResponse(xml);
  } catch {
    const fallbackXml = buildUrlsetXml([
      {
        loc: `${BASE_URL}/`,
        lastmod: new Date().toISOString(),
        changefreq: "daily",
        priority: 1,
      },
    ]);

    return xmlResponse(fallbackXml);
  }
}
