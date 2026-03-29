import type { HelpCategory } from "@/content/help/categories";

export type HelpLocale = "en";

export type HelpScreenshot = {
    src: string;
    alt: string;
    width?: number;
    height?: number;
};

export type HelpStep = {
    id: string;
    title: string;
    description: string;
    screenshots?: HelpScreenshot[];
    bullets?: string[];
};

export type HelpFaqItem = {
    question: string;
    answer: string;
};

export type HelpVideo = {
    youtubeId: string;
    durationSec?: number;
};

export type HelpArticle = {
    slug: string;
    locale: HelpLocale;
    category: HelpCategory;
    title: string;
    description: string;
    overview: string;
    lastUpdated: string;
    video?: HelpVideo;
    steps: HelpStep[];
    tips?: string[];
    faqs?: HelpFaqItem[];
    keywords?: string[];
    relatedSlugs?: string[];
    featureKey?: "leads" | "students" | "courses" | "batches" | "fees" | "whatsapp" | "onboarding";
    isPublished?: boolean;
};
