import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Public Institute Page - Classes360",
    description: "Publish your institute profile online with a conversion-focused enquiry experience.",
};

export default function PublicInstitutePageFeaturePage() {
    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Public Institute Page</h1>
            <div className="mt-6 space-y-4 text-muted-foreground">
                <p>Create a branded institute profile page without separate website development effort.</p>
                <p>Show courses, contact information, and enquiry actions in one focused destination.</p>
                <p>Turn interest into trackable enquiries with direct admission workflow tracking.</p>
            </div>
        </main>
    );
}
