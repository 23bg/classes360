import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy - Classes360",
    description: "Privacy policy for Classes360 users and institutes.",
};

export default function PrivacyPage() {
    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Privacy Policy</h1>
            <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                <p>Classes360 collects only the data required to provide admissions, student, fees, and payment workflows for institutes.</p>
                <p>Institute data is processed securely and is accessible only to authorized users within the institute workspace.</p>
                <p>We do not sell institute or student data to third parties. Data is used only for product operation, support, and reliability.</p>
                <p>Institutes can request support for account and data-related questions through our support channels.</p>
                <p>By using Classes360, you consent to this policy and related product terms.</p>
            </div>
        </main>
    );
}
