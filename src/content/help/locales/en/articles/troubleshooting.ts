import type { HelpArticle } from "@/content/help/schema";

export const troubleshootingArticle: HelpArticle = {
    slug: "troubleshooting",
    locale: "en",
    category: "faq",
    title: "Troubleshooting Common Issues",
    description: "Quick fixes for frequent problems encountered by institute teams.",
    overview: "Use this article to resolve common access, data, and billing issues before contacting support.",
    lastUpdated: "2026-06-01",
    steps: [
        {
            id: "step1",
            title: "Fix login and access issues",
            description: "Start with account verification and permission checks.",
            bullets: [
                "Use forgot password if login fails",
                "Retry OTP after 60 seconds",
                "Check role permissions in team settings",
            ],
        },
        {
            id: "step2",
            title: "Resolve data save issues",
            description: "Verify required fields and connection before retrying.",
            bullets: [
                "Complete all required inputs",
                "Check internet connection",
                "Log out and retry if issue persists",
            ],
        },
        {
            id: "step3",
            title: "Check list filters and billing status",
            description: "Many visibility issues are caused by active filters or billing sync delays.",
            bullets: [
                "Clear list filters",
                "Reload after save",
                "Retry failed payment from billing section",
            ],
        },
    ],
    faqs: [
        {
            question: "How do I contact support?",
            answer: "Reach out through support WhatsApp or email in contact details. Annual plans receive priority response.",
        },
    ],
    keywords: ["troubleshooting", "login", "data", "billing", "support"],
};
