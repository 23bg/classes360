"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { HelpDoc } from "@/content/help/docs";
import { Input } from "@/components/ui/input";

type HelpSearchProps = {
    docs: HelpDoc[];
};

export default function HelpSearch({ docs }: HelpSearchProps) {
    const t = useTranslations("help");
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return docs;

        return docs.filter((doc) =>
            [
                doc.title,
                doc.slug,
                doc.description,
                doc.overview,
                ...(doc.keywords ?? []),
                ...doc.steps.flatMap((step) => [step.title, step.description, ...(step.bullets ?? [])]),
                ...(doc.faqs ?? []).flatMap((faq) => [faq.question, faq.answer]),
            ]
                .join(" ")
                .toLowerCase()
                .includes(term)
        );
    }, [docs, query]);

    return (
        <div className="rounded-xl border bg-card p-4">
            <label htmlFor="help-search" className="mb-2 block text-sm font-medium">
                {t("searchLabel")}
            </label>
            <Input
                id="help-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                autoComplete="off"
            />

            <div className="mt-4 space-y-2">
                {filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noGuidesFound")}</p>
                ) : (
                    filtered.map((doc) => (
                        <Link
                            key={doc.slug}
                            href={`/help/${doc.slug}`}
                            className="block rounded-md border px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-muted"
                        >
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">{doc.category}</p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
