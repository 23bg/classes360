import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: "Student Records for Coaching Institutes | Classes360",
    description: "Maintain complete student records in one place after admission conversion with coaching-focused operations.",
    alternates: { canonical: "/features/student-records" },
    openGraph: {
        title: "Student Records for Coaching Institutes | Classes360",
        description: "Maintain complete student records in one place after admission conversion with coaching-focused operations.",
        url: "/features/student-records",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Student Records for Coaching Institutes | Classes360",
        description: "Maintain complete student records in one place after admission conversion with coaching-focused operations.",
    },
};

export default function StudentRecordsFeaturePage() {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://classes360.online/" },
            { "@type": "ListItem", position: 2, name: "Features", item: "https://classes360.online/features" },
            { "@type": "ListItem", position: 3, name: "Student Records", item: "https://classes360.online/features/student-records" },
        ],
    };

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
            <JsonLd id="schema-breadcrumb-feature-student-records" data={breadcrumbSchema} />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Student Records</h1>
            <div className="mt-6 space-y-4 text-muted-foreground">
                <p>Store student information and admission details in a structured, searchable format.</p>
                <p>Map students to courses and batches without spreadsheet sprawl.</p>
                <p>Improve daily operations by keeping records clean, centralized, and team-accessible.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
                <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">View Pricing</Link>
                <Link href="/admission-crm" className="text-primary underline-offset-4 hover:underline">Explore Admission CRM</Link>
            </div>
        </main>
    );
}
