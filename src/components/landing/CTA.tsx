import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function CTA() {
    const t = useTranslations("cta");

    return (
        <div className="w-full bg-card">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 text-center">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">{t("title")}</h2>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                        <Link href="/signup">{t("primary")}</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                        <Link href="/contact">{t("secondary")}</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

