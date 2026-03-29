import type { Metadata } from "next";
import Link from "next/link";
import InstituteScoreTool from "@/modules/tools/components/InstituteScoreTool";

export const metadata: Metadata = {
    title: "Institute Digital Score",
    description: "Answer simple questions and get your institute's digital maturity score out of 100.",
};

export default function InstituteScorePage() {
    return (
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Institute Digital Score</h1>
                <p className="text-muted-foreground">Find out your institute digital score instantly.</p>
            </div>
            <InstituteScoreTool />
            <p className="text-sm text-muted-foreground">
                Run complete operations with <Link href="/features" className="text-primary underline-offset-4 hover:underline">platform features</Link> and <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">pricing plans</Link>.
            </p>
        </main>
    );
}
