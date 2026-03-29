import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: "Tuition Class Admission and Student Management Platform - Classes360",
    description: "Use Classes360 to simplify enquiry handling, admissions, student records, and fee tracking for tuition classes.",
};

export default function TuitionUseCasePage() {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://classes360.online/" },
            { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://classes360.online/use-cases" },
            { "@type": "ListItem", position: 3, name: "Tuition Classes", item: "https://classes360.online/use-cases/tuition-classes" },
        ],
    };

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
            <JsonLd id="schema-breadcrumb-tuition" data={breadcrumbSchema} />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">For Tuition Classes</h1>
            <div className="mt-6 space-y-4 text-muted-foreground">
                <p>Handle daily leads from parents and students without juggling multiple spreadsheets.</p>
                <p>Track calls, walk-ins, and follow-ups from first enquiry to confirmed admission.</p>
                <p>Maintain student records and admission status in one practical, easy-to-train workflow.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
                <Link href="/features" className="text-primary underline-offset-4 hover:underline">Explore Features</Link>
                <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">View Pricing</Link>
            </div>
        </main>
    );
}
