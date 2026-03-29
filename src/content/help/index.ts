import { HELP_CATEGORY_LABELS, HELP_CATEGORY_ORDER, type HelpCategory } from "@/content/help/categories";
import { enHelpArticles } from "@/content/help/locales/en";
import type { HelpArticle, HelpLocale } from "@/content/help/schema";

const HELP_ARTICLES_BY_LOCALE: Record<HelpLocale, HelpArticle[]> = {
    en: enHelpArticles,
};

export const DEFAULT_HELP_LOCALE: HelpLocale = "en";

export const getHelpArticles = (locale: HelpLocale = DEFAULT_HELP_LOCALE): HelpArticle[] =>
    (HELP_ARTICLES_BY_LOCALE[locale] ?? HELP_ARTICLES_BY_LOCALE[DEFAULT_HELP_LOCALE]).filter(
        (article) => article.isPublished !== false
    );

export const getArticleBySlug = (slug: string, locale: HelpLocale = DEFAULT_HELP_LOCALE): HelpArticle | undefined =>
    getHelpArticles(locale).find((article) => article.slug === slug);

export const getArticleIndexBySlug = (slug: string, locale: HelpLocale = DEFAULT_HELP_LOCALE): number =>
    getHelpArticles(locale).findIndex((article) => article.slug === slug);

export const getArticlesByCategory = (
    category: HelpCategory,
    locale: HelpLocale = DEFAULT_HELP_LOCALE
): HelpArticle[] => getHelpArticles(locale).filter((article) => article.category === category);

export const groupArticlesByCategory = (locale: HelpLocale = DEFAULT_HELP_LOCALE) =>
    HELP_CATEGORY_ORDER.map((category) => ({
        category,
        categoryLabel: HELP_CATEGORY_LABELS[category],
        articles: getArticlesByCategory(category, locale),
    })).filter((group) => group.articles.length > 0);

export const buildHelpSearchIndex = (locale: HelpLocale = DEFAULT_HELP_LOCALE) =>
    getHelpArticles(locale).map((article) => ({
        slug: article.slug,
        title: article.title,
        category: article.category,
        categoryLabel: HELP_CATEGORY_LABELS[article.category],
        content: [
            article.title,
            article.description,
            article.overview,
            ...(article.keywords ?? []),
            ...article.steps.flatMap((step) => [step.title, step.description, ...(step.bullets ?? [])]),
            ...(article.tips ?? []),
            ...(article.faqs ?? []).flatMap((faq) => [faq.question, faq.answer]),
        ]
            .join(" ")
            .toLowerCase(),
    }));
