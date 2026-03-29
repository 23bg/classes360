import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: "Computer Training Admission and Student Management Platform - Classes360",
    description: "Admission workflow for computer training centers with structured enquiry, student, and fee tracking.",
};

export default function ComputerTrainingUseCasePage() {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://classes360.online/" },
            { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://classes360.online/use-cases" },
            { "@type": "ListItem", position: 3, name: "Computer Training Centers", item: "https://classes360.online/use-cases/computer-training" },
        ],
    };

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
            <JsonLd id="schema-breadcrumb-computer-training" data={breadcrumbSchema} />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">For Computer Training Centers</h1>
            <div className="mt-6 space-y-4 text-muted-foreground">
                <p>Organize enquiries by course and batch so counsellors can respond faster.</p>
                <p>Track admissions and pending decisions with clear daily visibility.</p>
                <p>Move from fragmented records to one system for lead-to-student conversion.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
                <Link href="/features" className="text-primary underline-offset-4 hover:underline">Explore Features</Link>
                <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">View Pricing</Link>
            </div>
        </main>
    );
}
