import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import HelpSidebar from "@/components/help/help-sidebar";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("help");

    return {
        title: `${t("helpCenter")} | Classes360`,
        description: t("docsDescription"),
    };
}

type HelpLayoutProps = {
    children: ReactNode;
};

export default async function HelpLayout({ children }: HelpLayoutProps) {
    const t = await getTranslations("help");

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
            <header className="mb-8">
                <p className="text-sm font-medium uppercase tracking-wide text-primary">{t("helpCenter")}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{t("docsTitle")}</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                    {t("docsDescription")}
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
                <HelpSidebar />
                <div>{children}</div>
            </div>
        </main>
    );
}
