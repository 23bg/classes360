import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { INDIAN_CITIES } from "@/data/indianCities";
import { SEO_KEYWORDS } from "@/data/seoKeywords";

type ProgrammaticPageProps = {
    params: Promise<{ keyword: string; city: string }>;
};

function humanizeSlug(value: string) {
    return value
        .split("-")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// export async function generateStaticParams() {
//     return SEO_KEYWORDS.flatMap((keyword) =>
//         INDIAN_CITIES.map((city) => ({
//             keyword,
//             city,
//         })),
//     );
// }

export async function generateMetadata({ params }: ProgrammaticPageProps): Promise<Metadata> {
    const { keyword, city } = await params;

    const isValidKeyword = SEO_KEYWORDS.includes(keyword as (typeof SEO_KEYWORDS)[number]);
    const isValidCity = INDIAN_CITIES.includes(city as (typeof INDIAN_CITIES)[number]);

    if (!isValidKeyword || !isValidCity) {
        return {
            title: "Classes360",
            robots: { index: false, follow: false },
        };
    }

    const formattedKeyword = keyword.replaceAll("-", " ");

    return {
        title: `${formattedKeyword} in ${city} | Classes360`,
        description: `Manage admissions, enquiries, students and fees for coaching institutes in ${city} using Classes360.`,
        alternates: {
            canonical: `https://classes360.online/solutions/${keyword}/${city}`,
        },
        openGraph: {
            title: `${formattedKeyword} in ${city} | Classes360`,
            description: `Manage admissions, enquiries, students and fees for coaching institutes in ${city} using Classes360.`,
            type: "website",
            url: `https://classes360.online/solutions/${keyword}/${city}`,
        },
        twitter: {
            card: "summary_large_image",
            title: `${formattedKeyword} in ${city} | Classes360`,
            description: `Manage admissions, enquiries, students and fees for coaching institutes in ${city} using Classes360.`,
        },
    };
}

export default async function ProgrammaticSolutionPage({ params }: ProgrammaticPageProps) {
    const { keyword, city } = await params;

    const isValidKeyword = SEO_KEYWORDS.includes(keyword as (typeof SEO_KEYWORDS)[number]);
    const isValidCity = INDIAN_CITIES.includes(city as (typeof INDIAN_CITIES)[number]);

    if (!isValidKeyword || !isValidCity) {
        notFound();
    }

    const keywordLabel = humanizeSlug(keyword);
    const cityLabel = humanizeSlug(city);

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: `Is Classes360 suitable for ${keywordLabel.toLowerCase()} in ${cityLabel}?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: `Yes. Classes360 is designed for Indian coaching workflows and supports enquiry capture, admission, student records, and fee collection for institutes in ${cityLabel}.`,
                },
            },
            {
                "@type": "Question",
                name: `Can coaching teams in ${cityLabel} track lead-to-admission conversion in one dashboard?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Classes360 gives stage-wise pipeline visibility so owners and counselors can track follow-up quality, admissions closed, and pending actions without spreadsheet dependencies.",
                },
            },
            {
                "@type": "Question",
                name: "How quickly can an institute start with Classes360?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Most teams can start in a few days with onboarding help, role-based setup, and migration support for existing enquiry and student data.",
                },
            },
        ],
    };

    return (
        <main className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 lg:py-16">
            <JsonLd id={`schema-faq-${keyword}-${city}`} data={faqSchema} />

            <header className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    {keywordLabel} for Coaching Institutes in {cityLabel}
                </h1>
                <p className="text-muted-foreground">
                    Classes360 helps institutes in {cityLabel} manage enquiries, admissions, student operations, and fee workflows on one practical platform built for India-first coaching businesses.
                </p>
            </header>

            <section className="mt-8 space-y-4 text-muted-foreground">
                <h2 className="text-2xl font-semibold text-foreground">Coaching Institutes Ecosystem in {cityLabel}</h2>
                <p>
                    Coaching institutes in {cityLabel} operate in a highly competitive market where parent expectations, lead response speed, and counseling consistency directly affect admissions. Most teams manage enquiries from calls, walk-ins, social channels, and campaign forms at the same time. When these inputs are scattered across personal notes, WhatsApp chats, and separate spreadsheets, the institute loses a reliable view of what is happening in the pipeline. That is why a focused {keywordLabel.toLowerCase()} setup in {cityLabel} is not just a software preference. It is an operating necessity.
                </p>
                <p>
                    Institutes in {cityLabel} typically run multiple programs together such as entrance exam preparation, school support, foundational batches, and short skill courses. These programs have different conversion cycles and fee plan structures. If the team has no standardized workflow, counselor follow-ups become inconsistent, interested prospects cool down, and ownership becomes unclear. Classes360 centralizes these operational inputs so teams can run a predictable admission pipeline instead of reactive coordination.
                </p>
                <p>
                    The ecosystem also includes increasing digital discovery. Parents compare institutes online, students enquire through mobile-first forms, and counselors need context before every callback. A modern system should connect marketing-generated enquiries to admission actions with clear audit trails. Classes360 helps institutes in {cityLabel} move from fragmented data handling to process-led admissions by combining enquiry capture, counselor assignment, and decision tracking in one flow.
                </p>
            </section>

            <section className="mt-8 space-y-4 text-muted-foreground">
                <h2 className="text-2xl font-semibold text-foreground">Admission Management Challenges in {cityLabel}</h2>
                <p>
                    A common challenge for coaching teams in {cityLabel} is delayed response during peak admissions. When enquiry ownership is unclear or reminders are missing, callbacks happen late and conversion intent drops. Another challenge is duplicate or incomplete records, where the same prospect exists under different spellings or channels. This creates confusion in reporting and makes weekly planning unreliable. Classes360 solves this with structured lead records, stage tracking, and centralized notes so every team member works with the same context.
                </p>
                <p>
                    Institutes also struggle when admission and operations are disconnected. Once a student confirms, course mapping, batch allocation, fee schedule setup, and communication details must transfer accurately. Manual handoffs create mismatches and parent escalations. In many teams, these handoffs are done under pressure and errors become visible only after classes begin. Classes360 links admission data directly with student and fee workflows so transition quality improves across departments.
                </p>
                <p>
                    Reporting is another pain point. Owners in {cityLabel} need answers to practical questions: which channels convert best, which counselors need support, where the drop-offs happen, and what fee collection risk exists after admission. Spreadsheet-based reporting usually gives delayed and inconsistent answers. Classes360 provides live operational visibility so leadership can act early and improve admission outcomes across every cycle.
                </p>
            </section>

            <section className="mt-8 space-y-4 text-muted-foreground">
                <h2 className="text-2xl font-semibold text-foreground">How Classes360 Solves These Problems in {cityLabel}</h2>
                <p>
                    Classes360 is designed as a coaching-focused system rather than a generic enterprise CRM. Teams in {cityLabel} can capture enquiries from all major channels, assign counselor ownership, and move each record through configurable stages with timestamps and notes. This creates process discipline without adding unnecessary complexity. Since every activity is captured in one workspace, teams avoid context switching and managers get reliable oversight of execution quality.
                </p>
                <p>
                    The platform supports practical accountability. Counselors can manage follow-up queues, supervisors can review stalled leads, and owners can monitor conversion metrics that matter to admissions health. As students enroll, Classes360 supports structured onboarding into student records, batches, and fee plans. This connected flow removes the handoff gap that often causes operational friction after admission closure.
                </p>
                <p>
                    Classes360 also helps institutes in {cityLabel} improve parent communication consistency. Teams can reference shared records instead of personal memory, reducing contradictory responses and missed commitments. Over time, this leads to better conversion confidence, smoother onboarding, and stronger institutional credibility in local markets.
                </p>
            </section>

            <section className="mt-8 space-y-4 text-muted-foreground">
                <h2 className="text-2xl font-semibold text-foreground">Key Product Features for {keywordLabel} in {cityLabel}</h2>
                <ul className="list-disc space-y-2 pl-6">
                    <li>Unified enquiry capture with channel-level visibility and counselor ownership.</li>
                    <li>Stage-based admission workflows with reminders, notes, and timeline tracking.</li>
                    <li>Student profile creation connected to course, batch, and operational records.</li>
                    <li>Fee plan and installment tracking for better collection predictability.</li>
                    <li>Performance dashboards for source conversion, counselor outcomes, and admission velocity.</li>
                    <li>Role-aware access for front-office, counselors, operations, and leadership teams.</li>
                </ul>
                <p>
                    These capabilities help coaching institutes in {cityLabel} run disciplined operations while still adapting to local admission seasonality, varied course demand, and changing parent expectations.
                </p>
            </section>

            <section className="mt-8 space-y-4 rounded-xl border bg-muted/20 p-6">
                <h2 className="text-2xl font-semibold">Start Running Better Admissions in {cityLabel}</h2>
                <p className="text-muted-foreground">
                    If your team is evaluating {keywordLabel.toLowerCase()} options in {cityLabel}, Classes360 gives you a practical workflow that connects enquiries, admissions, students, and fees in one operating system.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                    <Link href="/pricing" className="font-medium text-primary underline-offset-4 hover:underline">See Pricing</Link>
                    <Link href="/features" className="font-medium text-primary underline-offset-4 hover:underline">Explore Features</Link>
                    <Link href="/use-cases" className="font-medium text-primary underline-offset-4 hover:underline">View Use Cases</Link>
                </div>
            </section>

            <section className="mt-8 space-y-3 text-muted-foreground">
                <h2 className="text-2xl font-semibold text-foreground">FAQ</h2>
                <h3 className="text-lg font-medium text-foreground">Does this page target coaching institutes in {cityLabel} specifically?</h3>
                <p>
                    Yes. The operational examples and workflow context are aligned with coaching-style admissions in {cityLabel}, including lead follow-ups, admissions conversion, and fee-linked onboarding.
                </p>
                <h3 className="text-lg font-medium text-foreground">Can Classes360 support both small and growing institutes?</h3>
                <p>
                    Yes. The product is used by owner-led teams and multi-user operations where process visibility and accountability are essential.
                </p>
                <h3 className="text-lg font-medium text-foreground">Can we replace spreadsheets and fragmented tools?</h3>
                <p>
                    Yes. Classes360 centralizes admissions and student workflows so teams can reduce manual dependencies and improve execution consistency.
                </p>
            </section>
        </main>
    );
}
