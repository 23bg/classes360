import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("pages");
    const title = t("pricingMetaTitle");
    const description = t("pricingMetaDescription");

    return {
        title,
        description,
        alternates: {
            canonical: "/pricing",
        },
        openGraph: {
            title,
            description,
            url: "/pricing",
            type: "website",
        },
        twitter: {
            title,
            description,
            card: "summary_large_image",
        },
    };
}

export default function PricingPage() {
    const pricingSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Classes360",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: "999",
            description: "Starter monthly plan",
        },
    };

    return (
        <main>
            <JsonLd id="schema-pricing-software" data={pricingSchema} />
            <Pricing />
            <CTA />
        </main>
    );
}

