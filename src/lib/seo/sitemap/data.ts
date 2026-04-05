import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { INDIAN_CITIES } from "@/data/indianCities";
import { SEO_KEYWORDS } from "@/data/seoKeywords";
import { BASE_URL, SITEMAP_CHUNK_SIZE } from "@/lib/seo/sitemap/constants";
import type { SitemapItemInput, SitemapUrlEntry } from "@/lib/seo/sitemap/types";
import { chunkArray, sanitizeSitemapItems } from "@/lib/seo/sitemap/utils";

const FALLBACK_TIME = new Date("2026-01-01T00:00:00.000Z");

const STATIC_ROUTES: SitemapItemInput[] = [
  { path: "/", changefreq: "daily", priority: 1, lastmod: FALLBACK_TIME },
  { path: "/pricing", changefreq: "weekly", priority: 0.9, lastmod: FALLBACK_TIME },
  { path: "/features", changefreq: "weekly", priority: 0.9, lastmod: FALLBACK_TIME },
  { path: "/contact", changefreq: "monthly", priority: 0.7, lastmod: FALLBACK_TIME },
  { path: "/blog", changefreq: "daily", priority: 0.7, lastmod: FALLBACK_TIME },
];

const BLOG_SLUGS_FROM_CONFIG = ["how-to-manage-admissions", "coaching-crm-playbook"] as const;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchBlogSlugsFromApi(): Promise<Array<{ slug: string; updatedAt?: Date | string }>> {
  const endpoint = process.env.SITEMAP_BLOG_API_ENDPOINT;
  if (!endpoint) return [];

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) return [];

    const parsed: Array<{ slug: string; updatedAt?: Date | string }> = [];

    for (const item of payload) {
      if (!item || typeof item !== "object") continue;
      const record = item as { slug?: unknown; updatedAt?: unknown };
      if (typeof record.slug !== "string" || !record.slug.trim()) continue;

      parsed.push({
        slug: slugify(record.slug),
        updatedAt:
          typeof record.updatedAt === "string" || record.updatedAt instanceof Date
            ? record.updatedAt
            : undefined,
      });
    }

    return parsed;
  } catch {
    return [];
  }
}

async function fetchInstituteAndCourseRoutes(): Promise<SitemapItemInput[]> {
  try {
    const institutes = await prisma.institute.findMany({
      where: { isOnboarded: true, slug: { not: null } },
      select: { id: true, slug: true, updatedAt: true },
    });

    if (!institutes.length) return [];

    const instituteItems: SitemapItemInput[] = institutes.flatMap((institute) => {
      if (!institute.slug) return [];

      return [
        {
          path: `/i/${institute.slug}`,
          lastmod: institute.updatedAt,
          changefreq: "daily",
          priority: 0.7,
        },
        {
          path: `/i/${institute.slug}/courses`,
          lastmod: institute.updatedAt,
          changefreq: "daily",
          priority: 0.6,
        },
      ];
    });

    const courses = await prisma.course.findMany({
      where: { instituteId: { in: institutes.map((i) => i.id) } },
      select: { instituteId: true, slug: true, name: true, updatedAt: true },
    });

    const instituteById = new Map(institutes.map((item) => [item.id, item.slug]));

    const courseItems: SitemapItemInput[] = courses.flatMap((course) => {
      const instituteSlug = instituteById.get(course.instituteId);
      if (!instituteSlug) return [];

      const courseSlug = slugify(course.slug || course.name || "");
      if (!courseSlug) return [];

      return [
        {
          path: `/i/${instituteSlug}/courses/${courseSlug}`,
          lastmod: course.updatedAt,
          changefreq: "weekly",
          priority: 0.6,
        },
      ];
    });

    return [...instituteItems, ...courseItems];
  } catch {
    return [];
  }
}

async function buildDynamicItems(): Promise<SitemapItemInput[]> {
  const keywordPages: SitemapItemInput[] = SEO_KEYWORDS.map((keyword) => ({
    path: `/${keyword}`,
    changefreq: "weekly",
    priority: 0.8,
    lastmod: FALLBACK_TIME,
  }));

  const keywordCityPages: SitemapItemInput[] = SEO_KEYWORDS.flatMap((keyword) =>
    INDIAN_CITIES.map((city) => ({
      path: `/${keyword}/${city}`,
      changefreq: "monthly",
      priority: 0.7,
      lastmod: FALLBACK_TIME,
    })),
  );

  const [blogApiRows, instituteRoutes] = await Promise.all([
    fetchBlogSlugsFromApi(),
    fetchInstituteAndCourseRoutes(),
  ]);

  const blogPagesFromApi: SitemapItemInput[] = blogApiRows.map((item) => ({
    path: `/blog/${item.slug}`,
    lastmod: item.updatedAt,
    changefreq: "monthly",
    priority: 0.7,
  }));

  const blogPagesFromConfig: SitemapItemInput[] = BLOG_SLUGS_FROM_CONFIG.map((slug) => ({
    path: `/blog/${slug}`,
    lastmod: FALLBACK_TIME,
    changefreq: "monthly",
    priority: 0.7,
  }));

  return [
    ...keywordPages,
    ...keywordCityPages,
    ...blogPagesFromApi,
    ...blogPagesFromConfig,
    ...instituteRoutes,
  ];
}

const getCachedDynamicEntries = unstable_cache(
  async () => sanitizeSitemapItems(await buildDynamicItems()),
  ["sitemap-dynamic-entries"],
  { revalidate: 3600 },
);

export function getStaticSitemapEntries(): SitemapUrlEntry[] {
  return sanitizeSitemapItems(STATIC_ROUTES);
}

export async function getDynamicSitemapEntries(): Promise<SitemapUrlEntry[]> {
  const items = await getCachedDynamicEntries();

  // Never return an empty dynamic dataset. Keep a canonical fallback URL.
  if (!items.length) {
    return sanitizeSitemapItems([
      { path: "/", changefreq: "daily", priority: 1, lastmod: FALLBACK_TIME },
    ]);
  }

  return items;
}

export async function getDynamicSitemapChunkCount(): Promise<number> {
  const dynamicEntries = await getDynamicSitemapEntries();
  return Math.max(1, Math.ceil(dynamicEntries.length / SITEMAP_CHUNK_SIZE));
}

export async function getDynamicSitemapChunk(chunkId: number): Promise<SitemapUrlEntry[]> {
  const dynamicEntries = await getDynamicSitemapEntries();
  const chunks = chunkArray(dynamicEntries, SITEMAP_CHUNK_SIZE);

  if (chunkId < 0 || chunkId >= chunks.length) {
    return sanitizeSitemapItems([
      { path: "/", changefreq: "daily", priority: 1, lastmod: FALLBACK_TIME },
    ]);
  }

  return chunks[chunkId];
}

export function getSitemapIndexUrls(chunkCount: number): string[] {
  const urls = [`${BASE_URL}/sitemap-static.xml`];

  for (let id = 0; id < chunkCount; id += 1) {
    urls.push(`${BASE_URL}/sitemap-dynamic-${id}.xml`);
  }

  return urls;
}
