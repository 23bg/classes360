import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms - Classes360",
    description: "Terms of service for Classes360 subscriptions and usage.",
};

export default function TermsPage() {
    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Terms of Service</h1>
            <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                <p>Classes360 is provided as a subscription SaaS product for coaching institute operations.</p>
                <p>Users are responsible for maintaining accurate information and authorized access to their institute account.</p>
                <p>Subscription billing, renewal, and cancellation are governed by the active plan shown in the billing section.</p>
                <p>Misuse of the platform, unauthorized access, or unlawful use may result in account suspension.</p>
                <p>Using Classes360 indicates acceptance of these terms and future policy updates.</p>
            </div>
        </main>
    );
}
