export type SitemapChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapItemInput {
  path: string;
  lastmod?: string | Date;
  changefreq?: SitemapChangeFreq;
  priority?: number;
  indexable?: boolean;
}

export interface SitemapUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: SitemapChangeFreq;
  priority: number;
}

export interface SitemapChunkResult {
  chunkId: number;
  items: SitemapUrlEntry[];
}
