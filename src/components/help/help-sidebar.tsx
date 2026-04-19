"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { getHelpDocsByCategory } from "@/content/help/docs";

export default function HelpSidebar() {
    const t = useTranslations("help");
    const pathname = usePathname();
    const groups = getHelpDocsByCategory();

    return (
        <aside className="w-full rounded-xl border bg-card p-4 md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground">{t("documentation")}</h2>

            <div className="space-y-5">
                {groups.map((group) => (
                    <section key={group.category}>
                        <h3 className="mb-2 text-sm font-medium">{group.category}</h3>
                        <ul className="space-y-1.5">
                            {group.docs.map((doc) => {
                                const href = `/help/${doc.slug}`;
                                const isActive = pathname === href;

                                return (
                                    <li key={doc.slug}>
                                        <Link
                                            href={href}
                                            className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                }`}
                                        >
                                            {doc.title}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                ))}
            </div>
        </aside>
    );
}
