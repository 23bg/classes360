import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Use Cases - Classes360",
    description: "Explore how coaching institutes use Classes360 to run enquiry, admission, student, and fee operations in one platform.",
    alternates: {
        canonical: "/use-cases",
    },
    openGraph: {
        title: "Use Cases - Classes360",
        description: "Explore how coaching institutes use Classes360 to run enquiry, admission, student, and fee operations in one platform.",
        url: "/use-cases",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Use Cases - Classes360",
        description: "Explore how coaching institutes use Classes360 to run enquiry, admission, student, and fee operations in one platform.",
    },
};

const useCases = [
    {
        title: "JEE / NEET Coaching",
        href: "/use-cases/jee-neet-coaching",
        description: "Handle high enquiry volumes and track every enquiry until admission.",
    },
    {
        title: "Tuition Classes",
        href: "/use-cases/tuition-classes",
        description: "Manage walk-ins, calls, and referrals in one structured admission workflow.",
    },
    {
        title: "Computer Training Centers",
        href: "/use-cases/computer-training",
        description: "Organize course-wise enquiries and improve conversion follow-through.",
    },
    {
        title: "Skill Institutes",
        href: "/use-cases/skill-centers",
        description: "Run short-course admissions with clear student pipeline visibility.",
    },
];

export default function UseCasesPage() {
    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 lg:py-16">
            <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Use Cases</p>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Admission and Student Management Platform for Coaching Institutes</h1>
                <p className="max-w-3xl text-muted-foreground">
                    Classes360 is built for the real operating style of Indian coaching institutes, from large coaching centers to focused skill academies.
                </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
                {useCases.map((item) => (
                    <article key={item.href} className="rounded-xl border p-5">
                        <h2 className="text-lg font-semibold">{item.title}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                        <Link href={item.href} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                            Read use case
                        </Link>
                    </article>
                ))}
            </div>

            <section className="mt-8 rounded-xl border p-5">
                <h2 className="text-xl font-semibold">City-Specific CRM Pages</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Explore admission CRM pages tailored for major coaching markets.
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <Link href="/solutions/admission-crm/pune" className="font-medium text-primary hover:underline">Admission CRM in Pune</Link>
                    <Link href="/solutions/admission-crm/delhi" className="font-medium text-primary hover:underline">Admission CRM in Delhi</Link>
                    <Link href="/solutions/admission-crm/mumbai" className="font-medium text-primary hover:underline">Admission CRM in Mumbai</Link>
                </div>
            </section>
        </main>
    );
}
