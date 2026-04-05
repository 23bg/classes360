import { BASE_URL } from "@/lib/seo/sitemap/constants";
import { getDynamicSitemapChunk } from "@/lib/seo/sitemap/data";
import { buildUrlsetXml, xmlResponse } from "@/lib/seo/sitemap/xml";

function parseChunkId(requestUrl: string): number {
  const url = new URL(requestUrl);
  const idParam = url.searchParams.get("id") ?? "0";
  const parsed = Number.parseInt(idParam, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export async function GET(request: Request): Promise<Response> {
  const chunkId = parseChunkId(request.url);

  try {
    const chunkEntries = await getDynamicSitemapChunk(chunkId);
    const xml = buildUrlsetXml(chunkEntries);
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
