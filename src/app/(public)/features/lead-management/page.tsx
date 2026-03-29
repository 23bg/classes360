import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: "Lead Management for Coaching Institutes | Classes360",
    description: "Track every admission enquiry from first touchpoint to final enrollment with a coaching-focused workflow.",
    alternates: { canonical: "/features/lead-management" },
    openGraph: {
        title: "Lead Management for Coaching Institutes | Classes360",
        description: "Track every admission enquiry from first touchpoint to final enrollment with a coaching-focused workflow.",
        url: "/features/lead-management",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Lead Management for Coaching Institutes | Classes360",
        description: "Track every admission enquiry from first touchpoint to final enrollment with a coaching-focused workflow.",
    },
};

export default function LeadManagementFeaturePage() {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://classes360.online/" },
            { "@type": "ListItem", position: 2, name: "Features", item: "https://classes360.online/features" },
            { "@type": "ListItem", position: 3, name: "Lead Management", item: "https://classes360.online/features/lead-management" },
        ],
    };

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
            <JsonLd id="schema-breadcrumb-feature-lead-management" data={breadcrumbSchema} />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Lead Management</h1>
            <div className="mt-6 space-y-4 text-muted-foreground">
                <p>Capture enquiries from forms, links, and QR flows in one unified pipeline.</p>
                <p>Move leads across stages, assign follow-ups, and track conversion outcomes clearly.</p>
                <p>Get practical visibility for owners without complex tools or scattered spreadsheets.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
                <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">View Pricing</Link>
                <Link href="/admission-crm" className="text-primary underline-offset-4 hover:underline">Explore Admission CRM</Link>
            </div>
        </main>
    );
}
