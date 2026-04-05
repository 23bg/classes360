import { BASE_URL } from "@/lib/seo/sitemap/constants";
import {
  getDynamicSitemapChunkCount,
  getSitemapIndexUrls,
} from "@/lib/seo/sitemap/data";
import { buildSitemapIndexXml, xmlResponse } from "@/lib/seo/sitemap/xml";

export async function GET(): Promise<Response> {
  const nowIso = new Date().toISOString();

  try {
    const chunkCount = await getDynamicSitemapChunkCount();
    const sitemapUrls = getSitemapIndexUrls(chunkCount);
    const xml = buildSitemapIndexXml(sitemapUrls, nowIso);
    return xmlResponse(xml);
  } catch {
    const fallbackXml = buildSitemapIndexXml([`${BASE_URL}/sitemap-static.xml`], nowIso);
    return xmlResponse(fallbackXml);
  }
}
