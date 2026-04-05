import { BASE_URL } from "@/lib/seo/sitemap/constants";
import type { SitemapItemInput, SitemapUrlEntry } from "@/lib/seo/sitemap/types";

const DEFAULT_CHANGEFREQ = "weekly" as const;
const DEFAULT_PRIORITY = 0.7;

function clampPriority(priority?: number): number {
  if (priority == null || Number.isNaN(priority)) return DEFAULT_PRIORITY;
  return Math.min(1, Math.max(0, priority));
}

function toIsoDate(input?: string | Date): string {
  if (!input) return new Date().toISOString();
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizePath(path: string): string {
  if (!path) return "/";
  const [cleanPath] = path.split(/[?#]/);
  if (!cleanPath) return "/";
  const withLeadingSlash = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  if (withLeadingSlash !== "/" && withLeadingSlash.endsWith("/")) {
    return withLeadingSlash.slice(0, -1);
  }

  return withLeadingSlash;
}

function toAbsoluteUrl(path: string): string {
  const normalizedPath = normalizePath(path);
  return new URL(normalizedPath, `${BASE_URL}/`).toString().replace(/\/$/, "");
}

export function sanitizeSitemapItems(items: SitemapItemInput[]): SitemapUrlEntry[] {
  const unique = new Map<string, SitemapUrlEntry>();

  for (const item of items) {
    if (!item?.indexable && item?.indexable !== undefined) continue;
    if (!item?.path) continue;

    const path = normalizePath(item.path);
    if (!path || path === "") continue;

    const loc = toAbsoluteUrl(path);
    if (unique.has(loc)) continue;

    unique.set(loc, {
      loc,
      lastmod: toIsoDate(item.lastmod),
      changefreq: item.changefreq ?? DEFAULT_CHANGEFREQ,
      priority: clampPriority(item.priority),
    });
  }

  return [...unique.values()];
}

export function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) return [items];
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  return chunks;
}
