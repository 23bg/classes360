"use client"

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { HelpDoc } from "@/content/help/docs";

type HelpArticleProps = {
    doc: HelpDoc;
    previousDoc?: HelpDoc;
    nextDoc?: HelpDoc;
};

type ScreenshotPreview = {
    src: string;
    alt: string;
    title: string;
    description: string;
};

export default function HelpArticle({ doc, previousDoc, nextDoc }: HelpArticleProps) {
    const t = useTranslations("helpArticlePreview");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [activePreview, setActivePreview] = useState<ScreenshotPreview | null>(null);

    const embedUrl = doc.video?.youtubeId
        ? `https://www.youtube.com/embed/${doc.video.youtubeId}`
        : undefined;

    const openPreview = (screenshot: { src: string; alt: string }, step: { title: string; description: string }) => {
        setActivePreview({
            src: screenshot.src,
            alt: screenshot.alt,
            title: step.title,
            description: step.description,
        });
        setPreviewOpen(true);
    };

    return (
        <article className="rounded-xl border bg-card p-5 md:p-8">
            <header className="mb-8 space-y-2 pb-6">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{doc.category}</p>
                <h1 className="text-3xl font-semibold tracking-tight">{doc.title}</h1>
                <p className="text-sm text-muted-foreground">{t("lastUpdated")} {doc.lastUpdated}</p>
                <p className="text-muted-foreground">{doc.description}</p>
                <p className="text-muted-foreground">{doc.overview}</p>
            </header>

            {embedUrl ? (
                <section className="mb-8">
                    <h2 className="mb-3 text-xl font-semibold">{t("watchDemo")}</h2>
                    <div className="aspect-video overflow-hidden rounded-lg border">
                        <iframe
                            src={embedUrl}
                            title={`${doc.title} video tutorial`}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                </section>
            ) : null}

            <div className="space-y-8">
                {doc.steps.map((step, index) => (
                    <section key={step.id} className="space-y-3">
                        <h2 className="text-xl font-semibold">{t("stepLabel")} {index + 1}: {step.title}</h2>
                        <p className="text-muted-foreground">{step.description}</p>

                        {step.bullets?.length ? (
                            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                                {step.bullets.map((bullet) => (
                                    <li key={bullet}>{bullet}</li>
                                ))}
                            </ul>
                        ) : null}

                        {step.screenshots?.length ? (
                            <div className="grid gap-3 md:grid-cols-2">
                                {step.screenshots.map((screenshot) => (
                                    <figure key={screenshot.src} className="overflow-hidden rounded-lg border">
                                        <button
                                            type="button"
                                            onClick={() => openPreview(screenshot, step)}
                                            className="group block w-full text-left"
                                        >
                                            <Image
                                                src={screenshot.src}
                                                alt={screenshot.alt}
                                                width={screenshot.width ?? 1280}
                                                height={screenshot.height ?? 720}
                                                className="h-auto w-full transition duration-200 group-hover:scale-[1.01]"
                                            />
                                            <figcaption className="border-t px-3 py-2 text-xs text-muted-foreground">
                                                {screenshot.alt}
                                            </figcaption>
                                        </button>
                                    </figure>
                                ))}
                            </div>
                        ) : null}
                    </section>
                ))}

                {previewOpen && activePreview ? (
                    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                        <DialogContent className="max-w-[95vw] max-h-[90vh] w-[95vw] overflow-hidden p-0">
                            <DialogHeader className="px-6 pt-6">
                                <DialogTitle>{activePreview.title}</DialogTitle>
                            </DialogHeader>
                            <div className="overflow-hidden bg-background">
                                <Image
                                    src={activePreview.src}
                                    alt={activePreview.alt}
                                    width={1920}
                                    height={1080}
                                    className="h-auto w-full object-contain"
                                />
                            </div>
                            <div className="space-y-3 border-t border-muted/10 bg-card px-6 py-5">
                                <DialogDescription>{activePreview.description}</DialogDescription>
                                <div className="rounded-lg border bg-background p-4">
                                    <p className="text-sm font-semibold">{t("screenshotHeading")}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">{activePreview.description}</p>
                                </div>
                                <div className="rounded-lg border bg-background p-4">
                                    <p className="text-sm font-semibold">{t("actionHeading")}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {t("actionText", { stepTitle: activePreview.title })}
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">{t("noteText", { note: activePreview.alt })}</p>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                ) : null}

                {doc.tips?.length ? (
                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold">{t("tipsHeading")}</h2>
                        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                            {doc.tips.map((tip) => (
                                <li key={tip}>{tip}</li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                {doc.faqs?.length ? (
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold">{t("faqHeading")}</h2>
                        {doc.faqs.map((faq) => (
                            <div key={faq.question} className="rounded-lg border p-4">
                                <h3 className="font-medium">{faq.question}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                            </div>
                        ))}
                    </section>
                ) : null}
            </div>

            <footer className="mt-10 grid gap-3 border-t pt-6 sm:grid-cols-2">
                {previousDoc ? (
                    <Link
                        href={`/help/${previousDoc.slug}`}
                        className="rounded-md border px-4 py-3 text-sm hover:bg-muted"
                    >
                        <p className="text-xs text-muted-foreground">{t("previous")}</p>
                        <p className="font-medium">{previousDoc.title}</p>
                    </Link>
                ) : (
                    <div />
                )}

                {nextDoc ? (
                    <Link
                        href={`/help/${nextDoc.slug}`}
                        className="rounded-md border px-4 py-3 text-sm text-left sm:text-right hover:bg-muted"
                    >
                        <p className="text-xs text-muted-foreground">{t("next")}</p>
                        <p className="font-medium">{nextDoc.title}</p>
                    </Link>
                ) : null}
            </footer>
        </article>
    );
}
