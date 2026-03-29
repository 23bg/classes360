import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { FEATURE_DEEP_DIVE_SLUGS, titleFromSlug } from "@/lib/seo/programmatic";

type FeaturePageProps = {
    params: Promise<{ featureSlug: string }>;
};

const FEATURE_SET = new Set(FEATURE_DEEP_DIVE_SLUGS);

// export function generateStaticParams() {
//     return FEATURE_DEEP_DIVE_SLUGS.map((featureSlug) => ({ featureSlug }));
// }

export async function generateMetadata({ params }: FeaturePageProps): Promise<Metadata> {
    const { featureSlug } = await params;
    if (!FEATURE_SET.has(featureSlug as (typeof FEATURE_DEEP_DIVE_SLUGS)[number])) {
        return { title: "Feature - Classes360", robots: { index: false, follow: false } };
    }

    const featureName = titleFromSlug(featureSlug);
    const title = `${featureName} for Coaching Institutes | Classes360`;
    const description = `Explore how ${featureName.toLowerCase()} works in Classes360 for coaching admissions, student operations, and growth workflows.`;

    return {
        title,
        description,
        alternates: { canonical: `/features/${featureSlug}` },
        openGraph: { title, description, url: `/features/${featureSlug}`, type: "website" },
        twitter: { card: "summary_large_image", title, description },
    };
}

export default async function FeatureDeepDivePage({ params }: FeaturePageProps) {
    const { featureSlug } = await params;
    if (!FEATURE_SET.has(featureSlug as (typeof FEATURE_DEEP_DIVE_SLUGS)[number])) {
        notFound();
    }

    const featureName = titleFromSlug(featureSlug);

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://classes360.online/" },
            { "@type": "ListItem", position: 2, name: "Features", item: "https://classes360.online/features" },
            { "@type": "ListItem", position: 3, name: featureName, item: `https://classes360.online/features/${featureSlug}` },
        ],
    };

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
            <JsonLd id={`schema-breadcrumb-feature-${featureSlug}`} data={breadcrumbSchema} />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{featureName}</h1>
            <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                    {featureName} in Classes360 is built for coaching teams that need practical execution, faster operations, and clean reporting across admissions and students.
                </p>
                <p>
                    Instead of fragmented tools, this workflow helps teams run structured operations with clear ownership, traceable activity, and measurable outcomes.
                </p>
                <p>
                    The result is better conversion quality, lower process leakage, and improved decision making for institute owners and operations leaders.
                </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
                <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">View Pricing</Link>
                <Link href="/admission-crm" className="text-primary underline-offset-4 hover:underline">Explore Admission CRM</Link>
            </div>
        </main>
    );
}
