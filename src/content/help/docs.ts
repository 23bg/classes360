import { HELP_CATEGORY_LABELS, HELP_CATEGORY_ORDER } from "@/content/help/categories";
import {
    getArticleBySlug,
    getArticleIndexBySlug,
    getHelpArticles,
    groupArticlesByCategory,
} from "@/content/help";
import type { HelpCategory } from "@/content/help/categories";
import type {
    HelpArticle as HelpDoc,
    HelpFaqItem,
    HelpScreenshot,
    HelpStep,
    HelpVideo,
} from "@/content/help/schema";

export type { HelpDoc, HelpCategory, HelpFaqItem, HelpScreenshot, HelpStep, HelpVideo };

export const helpDocs: HelpDoc[] = getHelpArticles();

export const helpCategories = HELP_CATEGORY_ORDER.map((category) => HELP_CATEGORY_LABELS[category]);

export const getHelpDocBySlug = (slug: string): HelpDoc | undefined => getArticleBySlug(slug);

export const getHelpDocIndex = (slug: string): number => getArticleIndexBySlug(slug);

export const getHelpDocsByCategory = () =>
    groupArticlesByCategory().map((group) => ({
        category: group.categoryLabel,
        docs: group.articles,
    }));
