import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEMO_VIDEO_EMBED_URL, DEMO_VIDEO_URL } from "@/constants/external-links";

export const metadata: Metadata = {
    title: "Demo Institute - Classes360",
    description: "Watch the Classes360 demo video to preview the platform experience.",
};

export default function DemoInstitutePage() {
    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 lg:py-16">
            <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Demo</p>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Watch the Classes360 product demo.</h1>
                <p className="max-w-3xl text-muted-foreground">
                    See how Classes360 handles enquiries, admissions, students, courses, and operations in one workflow.
                </p>
            </div>

            <div className="mt-8 rounded-xl border bg-muted/20 p-3">
                <div className="aspect-video overflow-hidden rounded-lg border bg-background">
                    <iframe
                        src={DEMO_VIDEO_EMBED_URL}
                        title="Classes360 demo video"
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    />
                </div>
            </div>

            <div className="mt-8 flex gap-3">
                <Button asChild>
                    <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href={DEMO_VIDEO_URL} target="_blank" rel="noopener noreferrer">Open on YouTube</Link>
                </Button>
            </div>
        </main>
    );
}

