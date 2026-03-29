import type { Metadata } from "next";
import Link from "next/link";
import LinkShortenerTool from "@/modules/tools/components/LinkShortenerTool";

export const metadata: Metadata = {
    title: "Free Link Shortener for Coaching Institutes",
    description: "Create short links for admission forms, WhatsApp campaigns, and institute pages.",
};

export default function LinkShortenerPage() {
    return (
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Free Link Shortener</h1>
                <p className="text-muted-foreground">Generate short links like classes360.online/l/abc123 in seconds.</p>
            </div>
            <LinkShortenerTool />
            <p className="text-sm text-muted-foreground">
                Run complete operations with <Link href="/features" className="text-primary underline-offset-4 hover:underline">platform features</Link> and <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">pricing plans</Link>.
            </p>
        </main>
    );
}
