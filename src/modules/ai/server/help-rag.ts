import Fuse from "fuse.js";
import { helpDocs } from "@/content/help/docs";
import type { HelpDoc } from "@/content/help/docs";

type SearchableDoc = {
    slug: string;
    title: string;
    description: string;
    overview: string;
    keywords: string[];
    sectionText: string;
    faqText: string;
};

const toSearchableDoc = (doc: HelpDoc): SearchableDoc => ({
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    overview: doc.overview,
    keywords: doc.keywords ?? [],
    sectionText: doc.steps
        .map((step) => `${step.title} ${step.description} ${(step.bullets ?? []).join(" ")}`)
        .join(" "),
    faqText: (doc.faqs ?? []).map((faq) => `${faq.question} ${faq.answer}`).join(" "),
});

const searchableDocs = helpDocs.map(toSearchableDoc);

const fuse = new Fuse(searchableDocs, {
    includeScore: true,
    shouldSort: true,
    threshold: 0.35,
    minMatchCharLength: 2,
    ignoreLocation: true,
    keys: [
        { name: "title", weight: 0.35 },
        { name: "description", weight: 0.2 },
        { name: "overview", weight: 0.15 },
        { name: "keywords", weight: 0.1 },
        { name: "sectionText", weight: 0.15 },
        { name: "faqText", weight: 0.05 },
    ],
});

const toContextSnippet = (doc: HelpDoc) => {
    const steps = doc.steps
        .slice(0, 4)
        .map((step, index) => {
            const bullets = (step.bullets ?? []).slice(0, 3).join("; ");
            return `${index + 1}. ${step.title}: ${step.description}${bullets ? ` | ${bullets}` : ""}`;
        })
        .join("\n");

    const faqs = (doc.faqs ?? [])
        .slice(0, 3)
        .map((faq) => `Q: ${faq.question} A: ${faq.answer}`)
        .join("\n");

    return [
        `Slug: ${doc.slug}`,
        `Title: ${doc.title}`,
        `Description: ${doc.description}`,
        `Overview: ${doc.overview}`,
        `Steps:\n${steps}`,
        faqs ? `FAQs:\n${faqs}` : "",
    ]
        .filter(Boolean)
        .join("\n");
};

export const searchHelpDocs = (query: string, limit = 3) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [] as HelpDoc[];

    const results = fuse.search(cleanQuery, { limit });

    return results
        .map((result) => helpDocs.find((doc) => doc.slug === result.item.slug))
        .filter((doc): doc is HelpDoc => Boolean(doc));
};

export const buildHelpContext = (query: string, limit = 3) => {
    const docs = searchHelpDocs(query, limit);

    return {
        docs,
        contextText: docs.map(toContextSnippet).join("\n\n---\n\n"),
    };
};
