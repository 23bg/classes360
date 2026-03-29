import Link from "next/link";

type SeoLandingPageProps = {
    title: string;
    problem: string;
    solution: string;
    features: string[];
    faqs: Array<{ q: string; a: string }>;
};

export default function SeoLandingPage({ title, problem, solution, features, faqs }: SeoLandingPageProps) {
    return (
        <main className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 lg:py-16">
            <section className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
                <p className="text-muted-foreground">Admission and student operations platform built for coaching institutes.</p>
            </section>

            <section className="mt-10 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Problem</h2>
                <p className="mt-3 text-muted-foreground">{problem}</p>
            </section>

            <section className="mt-6 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Solution</h2>
                <p className="mt-3 text-muted-foreground">{solution}</p>
            </section>

            <section className="mt-6 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Core Features</h2>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                    {features.map((feature) => (
                        <li key={feature}>- {feature}</li>
                    ))}
                </ul>
            </section>

            <section className="mt-6 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">FAQ</h2>
                <div className="mt-3 space-y-4">
                    {faqs.map((faq) => (
                        <div key={faq.q}>
                            <h3 className="font-medium">{faq.q}</h3>
                            <p className="text-sm text-muted-foreground">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-8 flex flex-wrap gap-4 text-sm">
                <Link href="/features" className="text-primary underline-offset-4 hover:underline">Explore Features</Link>
                <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">View Pricing</Link>
                <Link href="/contact" className="text-primary underline-offset-4 hover:underline">Talk to Team</Link>
            </section>
        </main>
    );
}
