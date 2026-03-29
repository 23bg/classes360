import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { DEMO_VIDEO_EMBED_URL, DEMO_VIDEO_URL } from "@/constants/external-links";

export default function Demo() {
    const t = useTranslations("demo");

    return (
        <section className="w-full border-b ">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 md:grid-cols-2 md:items-center md:px-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h2>
                    <p className="mt-3 text-muted-foreground">{t("description")}</p>
                    <Button asChild className="mt-6" variant="outline">
                        <Link href={DEMO_VIDEO_URL} target="_blank" rel="noopener noreferrer">{t("cta")}</Link>
                    </Button>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3">
                    <div className="aspect-video overflow-hidden rounded-lg border bg-background">
                        <iframe
                            src={DEMO_VIDEO_EMBED_URL}
                            title={t("previewAlt")}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

