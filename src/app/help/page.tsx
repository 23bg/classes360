import Link from "next/link";
import { getTranslations } from "next-intl/server";
import HelpSearch from "@/components/help/help-search";
import { getHelpDocsByCategory, helpDocs } from "@/content/help/docs";

export default async function HelpHomePage() {
    const t = await getTranslations("help");
    const groupedDocs = getHelpDocsByCategory();

    return (
        <div className="space-y-6">
            <HelpSearch docs={helpDocs} />

            <section className="rounded-xl border bg-card p-5 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">{t("browseByCategory")}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {groupedDocs.map((group) => (
                        <div key={group.category} className="rounded-lg border p-4">
                            <h3 className="mb-2 font-medium">{group.category}</h3>
                            <ul className="space-y-1.5 text-sm">
                                {group.docs.map((doc) => (
                                    <li key={doc.slug}>
                                        <Link
                                            href={`/help/${doc.slug}`}
                                            className="text-muted-foreground hover:text-foreground hover:underline"
                                        >
                                            {doc.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
