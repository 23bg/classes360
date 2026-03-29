import { buildHelpSearchIndex, getHelpArticles } from "@/content/help";
import type { HelpArticle, HelpLocale } from "@/content/help/schema";

export const searchHelpArticles = (query: string, locale: HelpLocale = "en"): HelpArticle[] => {
    const term = query.trim().toLowerCase();
    if (!term) return getHelpArticles(locale);

    const index = buildHelpSearchIndex(locale);
    const matchingSlugs = index.filter((item) => item.content.includes(term)).map((item) => item.slug);
    const articleMap = new Map(getHelpArticles(locale).map((article) => [article.slug, article]));

    return matchingSlugs
        .map((slug) => articleMap.get(slug))
        .filter((article): article is HelpArticle => Boolean(article));
};
