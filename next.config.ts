import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
    allowedDevOrigins: ["127.0.0.1"],
    // Redirect legacy sitemap files to the consolidated sitemap.xml so
    // search engines stop requesting old index files.
    async redirects() {
        return [
            {
                source: "/sitemap-static.xml",
                destination: "/sitemap.xml",
                permanent: true,
            },
            {
                source: "/sitemap-dynamic-:id.xml",
                destination: "/sitemap.xml",
                permanent: true,
            },
            {
                source: "/sitemap-dynamic.xml",
                destination: "/sitemap.xml",
                permanent: true,
            },
        ];
    },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
