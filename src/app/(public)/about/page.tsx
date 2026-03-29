import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About - Classes360",
    description: "Learn why Classes360 was built for coaching institutes.",
    alternates: {
        canonical: "/about",
    },
    openGraph: {
        title: "About - Classes360",
        description: "Learn why Classes360 was built for coaching institutes.",
        url: "/about",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "About - Classes360",
        description: "Learn why Classes360 was built for coaching institutes.",
    },
};

export default function AboutPage() {
    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">About Classes360</h1>
            <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                    Classes360 is built for coaching institutes that want simple, practical control over enquiries, admissions, fees, and collections.
                </p>
                <p>
                    Our goal is to help institute owners run daily operations with clarity, without complex tools or long training.
                </p>
                <p>
                    From lead capture to payment tracking, Classes360 focuses on the workflows institutes use every day.
                </p>
            </div>
        </main>
    );
}
