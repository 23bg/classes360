import type { Metadata } from "next";
import Link from "next/link";
import QrCodeGeneratorTool from "@/modules/tools/components/QrCodeGeneratorTool";

export const metadata: Metadata = {
    title: "Free QR Code Generator for Coaching Institutes",
    description: "Generate QR codes for admission forms, WhatsApp, and websites. Free QR code generator for coaching institutes.",
};

export default function QrCodeGeneratorPage() {
    return (
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Free QR Code Generator</h1>
                <p className="text-muted-foreground">Create and download QR codes instantly.</p>
            </div>
            <QrCodeGeneratorTool />
            <p className="text-sm text-muted-foreground">
                Run complete operations with <Link href="/features" className="text-primary underline-offset-4 hover:underline">platform features</Link> and <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">pricing plans</Link>.
            </p>
        </main>
    );
}
