import type { Metadata } from "next";
import Link from "next/link";
import ExcelTemplatesTool from "@/modules/tools/components/ExcelTemplatesTool";

export const metadata: Metadata = {
    title: "Free Excel Templates for Coaching Institutes",
    description: "Download free student, attendance, fees, and leads templates in CSV and Excel format.",
};

export default function TemplatesPage() {
    return (
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Free Excel Templates</h1>
                <p className="text-muted-foreground">Ready-to-use formats for institute operations.</p>
            </div>
            <ExcelTemplatesTool />
            <p className="text-sm text-muted-foreground">
                Run complete operations with <Link href="/features" className="text-primary underline-offset-4 hover:underline">platform features</Link> and <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">pricing plans</Link>.
            </p>
        </main>
    );
}
