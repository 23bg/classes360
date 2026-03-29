import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Subscription Billing - Classes360",
    description: "Manage institute plan subscriptions with secure Razorpay billing workflows.",
};

export default function SubscriptionBillingFeaturePage() {
    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Subscription Billing</h1>
            <div className="mt-6 space-y-4 text-muted-foreground">
                <p>Run recurring subscriptions with secure Razorpay checkout and payment reliability.</p>
                <p>Keep billing status visible so institutes understand plan state without confusion.</p>
                <p>Support straightforward upgrades and renewals as teams grow.</p>
            </div>
        </main>
    );
}
