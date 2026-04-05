import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
    allowedDevOrigins: ["127.0.0.1"],
    async rewrites() {
        return [
            {
                source: "/sitemap-dynamic-:id.xml",
                destination: "/sitemap-dynamic-[id].xml?id=:id",
            },
        ];
    },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
