import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: "Skill Institute Admission and Student Management Platform - Classes360",
    description: "Manage admissions, student records, and fee operations for short-term skill programs with Classes360.",
};

export default function SkillCentersUseCasePage() {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://classes360.online/" },
            { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://classes360.online/use-cases" },
            { "@type": "ListItem", position: 3, name: "Skill Institutes", item: "https://classes360.online/use-cases/skill-centers" },
        ],
    };

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
            <JsonLd id="schema-breadcrumb-skill-centers" data={breadcrumbSchema} />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">For Skill Institutes</h1>
            <div className="mt-6 space-y-4 text-muted-foreground">
                <p>Run admissions for short courses with clear enquiry ownership and follow-up history.</p>
                <p>Track which sources and counselors convert best so efforts stay focused.</p>
                <p>Keep student onboarding details in one place without operational clutter.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
                <Link href="/features" className="text-primary underline-offset-4 hover:underline">Explore Features</Link>
                <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">View Pricing</Link>
            </div>
        </main>
    );
}
