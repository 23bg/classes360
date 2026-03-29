import type { HelpArticle } from "@/content/help/schema";

export const faqArticle: HelpArticle = {
    slug: "faq",
    locale: "en",
    category: "faq",
    title: "Frequently Asked Questions",
    description: "Common questions from institute owners and admin teams.",
    overview: "Quick answers for account management, operations, and daily CRM usage.",
    lastUpdated: "2026-03-10",
    steps: [
        {
            id: "step1",
            title: "Review account and team basics",
            description: "Start here for access and daily operational questions.",
        },
    ],
    faqs: [
        {
            question: "How do I reset my password?",
            answer: "Use forgot password on login and verify through OTP.",
        },
        {
            question: "How can I invite staff members?",
            answer: "Go to Team in the dashboard, create accounts, and assign permissions.",
        },
        {
            question: "Can I delete an enquiry?",
            answer: "Yes. Invalid or duplicate enquiries can be removed from lead records.",
        },
    ],
    keywords: ["faq", "support", "team", "password"],
};
