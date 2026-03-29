import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SEO_KEYWORDS } from "@/data/seoKeywords";

type KeywordPageProps = {
    params: Promise<{ keyword: string }>;
};

function humanizeSlug(value: string) {
    return value
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

// ✅ Static generation
// export function generateStaticParams() {
//     return SEO_KEYWORDS.map((keyword) => ({ keyword }));
// }

// ✅ Metadata
export async function generateMetadata({
    params,
}: KeywordPageProps): Promise<Metadata> {
    const { keyword } = await params;

    if (!SEO_KEYWORDS.includes(keyword as any)) {
        return {
            title: "Classes360",
            robots: { index: false, follow: false },
        };
    }

    const readable = keyword.replaceAll("-", " ");

    return {
        title: `${readable} | Classes360`,
        description: `Manage admissions, enquiries, students and fees using ${readable} with Classes360.`,
        alternates: {
            canonical: `https://classes360.online/${keyword}`,
        },
        openGraph: {
            title: `${readable} | Classes360`,
            description: `Manage admissions, enquiries, students and fees using ${readable} with Classes360.`,
            url: `https://classes360.online/${keyword}`,
            type: "website",
        },
    };
}

// ✅ Page
export default async function KeywordPage({ params }: KeywordPageProps) {
    const { keyword } = await params;

    if (!SEO_KEYWORDS.includes(keyword as any)) {
        notFound();
    }

    const keywordLabel = humanizeSlug(keyword);

    return (
        <main className="mx-auto max-w-5xl px-4 py-12">

            {/* HERO */}
            <header className="space-y-4">
                <h1 className="text-3xl font-bold md:text-4xl">
                    {keywordLabel} for Coaching Institutes
                </h1>

                <p className="text-muted-foreground">
                    Classes360 is a complete {keywordLabel.toLowerCase()} platform designed for coaching institutes to manage enquiries, admissions, students, and fee workflows in one unified system.
                </p>
            </header>

            {/* PROBLEM */}
            <section className="mt-10 space-y-4">
                <h2 className="text-2xl font-semibold">
                    Why {keywordLabel} is critical for coaching institutes
                </h2>
                <p>
                    Most coaching institutes rely on WhatsApp, spreadsheets, and manual tracking to manage enquiries and admissions. This leads to missed follow-ups, poor visibility, and inconsistent conversions.
                </p>
                <p>
                    A structured {keywordLabel.toLowerCase()} helps institutes centralize data, track every lead, and improve admission outcomes with better process control.
                </p>
            </section>

            {/* USE CASES */}
            <section className="mt-10 space-y-4">
                <h2 className="text-2xl font-semibold">
                    Where {keywordLabel} is used
                </h2>

                <ul className="list-disc pl-6 space-y-2">
                    <li>NEET / JEE coaching institutes</li>
                    <li>Tuition classes and academic coaching</li>
                    <li>Skill-based training centers</li>
                    <li>Computer and IT institutes</li>
                    <li>Competitive exam coaching (UPSC, SSC, Banking)</li>
                </ul>
            </section>

            {/* FEATURES */}
            <section className="mt-10 space-y-4">
                <h2 className="text-2xl font-semibold">
                    Key Features of {keywordLabel}
                </h2>

                <ul className="list-disc pl-6 space-y-2">
                    <li>Lead capture from calls, forms, WhatsApp, and walk-ins</li>
                    <li>Admission pipeline tracking with stage visibility</li>
                    <li>Student profile and batch management</li>
                    <li>Fee collection and installment tracking</li>
                    <li>Performance analytics and reporting dashboards</li>
                    <li>Role-based access for counselors and admins</li>
                </ul>
            </section>

            {/* DIFFERENTIATION */}
            <section className="mt-10 space-y-4">
                <h2 className="text-2xl font-semibold">
                    Why Classes360 is different
                </h2>

                <p>
                    Unlike generic CRM tools, Classes360 is built specifically for coaching institutes in India. It understands admission cycles, counseling workflows, and fee structures unique to this industry.
                </p>

                <p>
                    This makes it easier for teams to adopt, reduces training time, and ensures better execution during peak admission seasons.
                </p>
            </section>

            {/* INTERNAL LINKING */}
            <section className="mt-10 space-y-4">
                <h2 className="text-2xl font-semibold">
                    Explore more solutions
                </h2>

                <div className="flex flex-wrap gap-3 text-sm">
                    <Link href="/admission-crm" className="underline">Admission CRM</Link>
                    <Link href="/student-management-software" className="underline">Student Management</Link>
                    <Link href="/coaching-institute-crm" className="underline">Coaching CRM</Link>
                </div>
            </section>

            {/* CTA */}
            <section className="mt-12 rounded-xl border p-6 space-y-4">
                <h2 className="text-xl font-semibold">
                    Start using {keywordLabel}
                </h2>

                <p className="text-muted-foreground">
                    Replace spreadsheets and manual tracking with a system designed for coaching admissions and student management.
                </p>

                <div className="flex gap-4 text-sm">
                    <Link href="/pricing" className="underline">View Pricing</Link>
                    <Link href="/features" className="underline">Explore Features</Link>
                </div>
            </section>

            {/* FAQ */}
            <section className="mt-12 space-y-4">
                <h2 className="text-2xl font-semibold">FAQ</h2>

                <div className="space-y-3 text-muted-foreground">
                    <p>
                        <strong>Is {keywordLabel.toLowerCase()} suitable for small institutes?</strong><br />
                        Yes, Classes360 is designed for both small and growing coaching institutes.
                    </p>

                    <p>
                        <strong>Can I replace Excel and WhatsApp tracking?</strong><br />
                        Yes, Classes360 centralizes all enquiry, admission, and student workflows.
                    </p>

                    <p>
                        <strong>How quickly can I start?</strong><br />
                        Most institutes can get started within a few days.
                    </p>
                </div>
            </section>

        </main>
    );
}
// export default async function KeywordPage({ params }: KeywordPageProps) {
//     const { keyword } = await params;

//     if (!SEO_KEYWORDS.includes(keyword as any)) {
//         notFound();
//     }

//     const keywordLabel = humanizeSlug(keyword);

//     return (
//         <main className="mx-auto max-w-5xl px-4 py-12">
//             <h1 className="text-3xl font-bold">
//                 {keywordLabel} for Coaching Institutes
//             </h1>

//             <p className="mt-4 text-muted-foreground">
//                 Classes360 provides a complete {keywordLabel.toLowerCase()} solution
//                 designed for coaching institutes to manage enquiries, admissions,
//                 students, and fee workflows in one system.
//             </p>

//             <section className="mt-8 space-y-4">
//                 <h2 className="text-xl font-semibold">
//                     Why {keywordLabel} matters
//                 </h2>
//                 <p>
//                     Coaching institutes need structured systems to track leads,
//                     manage admissions, and ensure consistent follow-ups. A proper{" "}
//                     {keywordLabel.toLowerCase()} eliminates spreadsheet chaos and
//                     improves conversion visibility.
//                 </p>
//             </section>

//             <section className="mt-8 space-y-4">
//                 <h2 className="text-xl font-semibold">
//                     How Classes360 helps
//                 </h2>
//                 <ul className="list-disc pl-6 space-y-2">
//                     <li>Centralized enquiry tracking</li>
//                     <li>Admission pipeline visibility</li>
//                     <li>Student record management</li>
//                     <li>Fee and installment tracking</li>
//                 </ul>
//             </section>

//             <div className="mt-10 flex gap-4 text-sm">
//                 <Link href="/pricing" className="underline">Pricing</Link>
//                 <Link href="/features" className="underline">Features</Link>
//             </div>
//         </main>
//     );
// }