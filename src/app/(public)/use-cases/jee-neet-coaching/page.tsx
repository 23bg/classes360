import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: "JEE / NEET Coaching Admission and Student Management Platform - Classes360",
    description: "Manage high-volume enquiries, admissions, students, and fee operations for JEE and NEET coaching centers.",
};

export default function JeeNeetUseCasePage() {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://classes360.online/" },
            { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://classes360.online/use-cases" },
            { "@type": "ListItem", position: 3, name: "JEE / NEET Coaching", item: "https://classes360.online/use-cases/jee-neet-coaching" },
        ],
    };

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
            <JsonLd id="schema-breadcrumb-jee-neet" data={breadcrumbSchema} />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">For JEE / NEET Coaching Institutes</h1>
            <div className="mt-6 space-y-4 text-muted-foreground">
                <p>Track large enquiry volumes from campaigns, referrals, and walk-ins in one pipeline.</p>
                <p>Never miss follow-ups during admission season with clear stage tracking per counsellor.</p>
                <p>Convert more serious prospects by moving from ad-hoc WhatsApp tracking to a structured admission workflow.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
                <Link href="/features" className="text-primary underline-offset-4 hover:underline">Explore Features</Link>
                <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">View Pricing</Link>
            </div>
        </main>
    );
}
