import type { Metadata } from "next";
import type { ReactNode } from "react";
import HelpSidebar from "@/components/help/help-sidebar";

export const metadata: Metadata = {
    title: "Classes360 Help Center",
    description: "Documentation, onboarding guides, and FAQs for institutes using Classes360.",
};

type HelpLayoutProps = {
    children: ReactNode;
};

export default function HelpLayout({ children }: HelpLayoutProps) {
    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
            <header className="mb-8">
                <p className="text-sm font-medium uppercase tracking-wide text-primary">Help Center</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Classes360 Documentation</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                    Guides, workflows, and answers to help your institute team run admissions and student operations smoothly.
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
                <HelpSidebar />
                <div>{children}</div>
            </div>
        </main>
    );
}
