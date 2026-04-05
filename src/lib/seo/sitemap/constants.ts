export const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://classes360.online";

export const SITEMAP_CHUNK_SIZE = 50000;

export const SITEMAP_CACHE_CONTROL =
  "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";
