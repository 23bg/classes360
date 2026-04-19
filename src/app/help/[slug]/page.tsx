import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import HelpArticle from "@/components/help/help-article";
import { getHelpDocBySlug, getHelpDocIndex, helpDocs } from "@/content/help/docs";

type HelpDocPageProps = {
    params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
    return helpDocs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: HelpDocPageProps): Promise<Metadata> {
    const t = await getTranslations("help");
    const { slug } = await params;
    const doc = getHelpDocBySlug(slug);

    if (!doc) {
        return {
            title: `${t("helpArticleNotFound")} | ${t("helpCenter")}`,
            robots: { index: false, follow: false },
        };
    }

    return {
        title: `${doc.title} | ${t("helpCenter")}`,
        description: doc.description,
        alternates: {
            canonical: `/help/${doc.slug}`,
        },
    };
}

export default async function HelpDocPage({ params }: HelpDocPageProps) {
    const { slug } = await params;
    const doc = getHelpDocBySlug(slug);

    if (!doc) {
        notFound();
    }

    const index = getHelpDocIndex(doc.slug);
    const previousDoc = index > 0 ? helpDocs[index - 1] : undefined;
    const nextDoc = index < helpDocs.length - 1 ? helpDocs[index + 1] : undefined;

    return <HelpArticle doc={doc} previousDoc={previousDoc} nextDoc={nextDoc} />;
}
