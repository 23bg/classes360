import type { Metadata } from "next";
import { Database, KeyRound, Lock, MessageSquareLock, ShieldCheck, Users } from "lucide-react";

export const metadata: Metadata = {
    title: "Classes360 Security - Data Protection & Privacy",
    description:
        "Learn how Classes360 protects institute and student data using secure architecture, encryption, and role-based access control.",
};

const securitySections = [
    {
        title: "Encryption & Secure Communication",
        icon: Lock,
        paragraphs: [
            "All data transmitted between users and the Classes360 platform is encrypted using TLS (HTTPS). This helps protect student records, institute details, and authentication sessions while data is in transit.",
            "Sensitive data such as passwords are stored using secure cryptographic hashing with bcrypt rather than plaintext storage.",
        ],
    },
    {
        title: "Secure Data Storage",
        icon: Database,
        paragraphs: [
            "Classes360 stores institute and student data in secure cloud-backed databases with controlled access. Data is scoped by institute so one organization cannot access another organization's records through the application.",
            "We avoid making claims about custom application-level encryption that are not part of the current implementation.",
        ],
        bullets: [
            "Secure database access controls",
            "Infrastructure-level encryption provided by cloud providers",
            "Institute-scoped data access patterns across application records",
            "Protection against unauthorized access through authenticated and authorized requests",
        ],
    },
    {
        title: "Role-Based Access Control",
        icon: Users,
        paragraphs: [
            "Access to sensitive data is restricted using role-based access control. The current platform supports Owner, Manager, and Viewer roles.",
            "Each role has specific permissions that limit what actions users can perform inside the system.",
        ],
        bullets: [
            "Only owners can manage billing and team members",
            "Managers can handle operational workflows and institute data updates",
            "Viewers have read-only access to operational data",
        ],
    },
    {
        title: "Secure Multi-Tenant Architecture",
        icon: ShieldCheck,
        paragraphs: [
            "Classes360 uses a multi-tenant architecture where each institute operates within its own scoped data environment.",
            "Records are associated with an institute identifier, which helps ensure that one institute cannot access another institute's data through normal application flows.",
        ],
    },
    {
        title: "Authentication & Session Security",
        icon: KeyRound,
        paragraphs: [
            "User authentication and session handling use multiple protections designed to reduce unauthorized access risk.",
        ],
        bullets: [
            "Secure password hashing with bcrypt",
            "Signed session tokens",
            "HTTP-only cookies for session storage",
            "Session expiration policies with bounded token lifetime",
        ],
    },
    {
        title: "Secure Communication Integrations",
        icon: MessageSquareLock,
        paragraphs: [
            "Classes360 integrates with the official Meta WhatsApp Cloud API for operational alerts.",
            "Communication between Classes360 and external services is performed over encrypted HTTPS connections, and message logs are stored for operational tracking within the platform.",
        ],
    },
];

const practices = [
    "Validated API inputs using schema-based validation",
    "Role-based authorization for sensitive actions",
    "Rate limiting on public lead capture forms",
    "Webhook signature verification for payment events",
    "Scoped institute access patterns across data operations",
];

export default function SecurityPage() {
    return (
        <main className="bg-muted/30">
            <section className="border-b bg-background">
                <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 lg:py-24">
                    <div className="max-w-3xl space-y-4">
                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
                            Security & Data Protection
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                            Your Institute Data is Protected
                        </h1>
                        <p className="text-base leading-7 text-muted-foreground md:text-lg">
                            Classes360 is designed with security and privacy as a core principle. We use modern security practices to protect institute operations, student records, and communication data.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 lg:py-16">
                <div className="grid gap-6 md:grid-cols-2">
                    {securitySections.map((section) => {
                        const Icon = section.icon;

                        return (
                            <article key={section.title} className="rounded border bg-background p-6 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-xl border bg-primary/5 p-3 text-primary">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
                                        <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                                            {section.paragraphs.map((paragraph) => (
                                                <p key={paragraph}>{paragraph}</p>
                                            ))}
                                        </div>
                                        {section.bullets ? (
                                            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                                {section.bullets.map((bullet) => (
                                                    <li key={bullet} className="flex gap-2">
                                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-12 md:px-6 lg:pb-16">
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <article className="rounded border bg-background p-6 shadow-sm">
                        <h2 className="text-2xl font-semibold tracking-tight">Institute Data Ownership</h2>
                        <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                            <p>Institutes fully own their data.</p>
                            <p>Classes360 does not sell, share, or expose institute or student data to third parties.</p>
                            <p>Data is used only for providing and operating the platform services.</p>
                        </div>
                    </article>

                    <article className="rounded border bg-background p-6 shadow-sm">
                        <h2 className="text-2xl font-semibold tracking-tight">Continuous Security Practices</h2>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            {practices.map((item) => (
                                <li key={item} className="flex gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </article>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6 lg:pb-24">
                <div className="rounded-3xl border bg-background p-8 text-center shadow-sm md:p-10">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        Built with Security in Mind
                    </h2>
                    <div className="mx-auto mt-4 max-w-3xl space-y-3 text-sm leading-6 text-muted-foreground md:text-base">
                        <p>
                            Classes360 is designed to provide a secure environment for managing institute operations and student records.
                        </p>
                        <p>
                            Security improvements continue to evolve as the platform grows.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}