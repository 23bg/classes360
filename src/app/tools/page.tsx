import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Free Tools for Coaching Institutes",
    description: "Free growth tools for coaching institutes: QR code generator, link shortener, course comparison, digital score, and templates.",
    alternates: {
        canonical: "/tools",
    },
    openGraph: {
        title: "Free Tools for Coaching Institutes",
        description: "Free growth tools for coaching institutes: QR code generator, link shortener, course comparison, digital score, and templates.",
        url: "/tools",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Tools for Coaching Institutes",
        description: "Free growth tools for coaching institutes: QR code generator, link shortener, course comparison, digital score, and templates.",
    },
};

const tools = [
    {
        title: "QR Code Generator",
        description: "Generate QR codes for websites, WhatsApp, and admission forms.",
        href: "/tools/qr-code-generator",
    },
    {
        title: "Link Shortener",
        description: "Create short links for campaigns, forms, and institute pages.",
        href: "/tools/link-shortener",
    },
    {
        title: "Course Comparison",
        description: "Compare coaching courses by city, fees, and duration.",
        href: "/tools/course-comparison",
    },
    {
        title: "Institute Digital Score",
        description: "Assess your institute's digital maturity in minutes.",
        href: "/tools/institute-score",
    },
    {
        title: "Excel Templates",
        description: "Download ready-to-use templates for students, attendance, fees, and leads.",
        href: "/tools/templates",
    },
];

export default function ToolsPage() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold">Free Tools</h1>
                <p className="text-muted-foreground">Use these tools without login to grow your coaching institute faster.</p>
                <p className="text-sm text-muted-foreground">
                    Looking for full operations? Explore the <Link href="/features" className="text-primary underline-offset-4 hover:underline">platform features</Link> and <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">pricing plans</Link>.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                    <Card key={tool.href}>
                        <CardHeader>
                            <CardTitle>{tool.title}</CardTitle>
                            <CardDescription>{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent />
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={tool.href}>Use Tool</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </main>
    );
}
