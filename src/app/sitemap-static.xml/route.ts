import { BASE_URL } from "@/lib/seo/sitemap/constants";

// Legacy sitemap route — redirect permanently to consolidated sitemap.xml.
export function GET(): Response {
  return Response.redirect(new URL("/sitemap.xml", BASE_URL).toString(), 301);
}
