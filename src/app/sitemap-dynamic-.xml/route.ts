import { BASE_URL } from "@/lib/seo/sitemap/constants";

// Legacy dynamic sitemap route — permanently redirect to consolidated sitemap.xml
// so crawlers and Search Console stop treating old dynamic sitemap files as active.
export function GET(): Response {
  return Response.redirect(new URL("/sitemap.xml", BASE_URL).toString(), 301);
}
