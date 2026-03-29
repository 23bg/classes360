import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PageContainer from "@/components/layout/PageContainer";
import Section from "@/components/layout/Section";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("pages");
    const title = t("contactMetaTitle");
    const description = t("contactMetaDescription");

    return {
        title,
        description,
        alternates: {
            canonical: "/contact",
        },
        openGraph: {
            title,
            description,
            url: "/contact",
            type: "website",
        },
        twitter: {
            title,
            description,
            card: "summary_large_image",
        },
    };
}

export default async function ContactPage() {
    const tCommon = await getTranslations("common");
    const t = await getTranslations("contactPage");

    return (
        <PageContainer>
            <div className="max-w-2xl space-y-3">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <Section>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-border bg-card">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">{tCommon("email")}</p>
                            <p className="mt-1 font-medium text-foreground">{t("emailValue")}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">{tCommon("whatsApp")}</p>
                            <p className="mt-1 font-medium text-foreground">{t("whatsAppValue")}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">{tCommon("supportHours")}</p>
                            <p className="mt-1 font-medium text-foreground">{t("supportHoursValue")}</p>
                        </CardContent>
                    </Card>
                </div>
            </Section>
        </PageContainer>
    );
}
