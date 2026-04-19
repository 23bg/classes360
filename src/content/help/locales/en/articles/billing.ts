import type { HelpArticle } from "@/content/help/schema";

export const billingArticle: HelpArticle = {
    slug: "billing",
    locale: "en",
    category: "feesAndBilling",
    title: "Subscription and Billing",
    description: "Understand Classes360 plans, free trial, billing cycle, and how to manage your subscription.",
    overview: "Review plans, trial details, billing options, and upgrade rules for your institute account.",
    lastUpdated: "2026-03-16",
    steps: [
        {
            id: "step1",
            title: "Choose plan",
            description: "Select Starter, Team, Growth, or Scale based on user seats and collaboration needs.",
            bullets: [
                "Starter: 1 user, INR 999/month",
                "Team: up to 5 users, INR 1,999/month",
                "Growth: up to 20 users, INR 3,499/month",
                "Scale: unlimited users, INR 4,999/month",
            ],
            screenshots: [
                {
                    src: "/images/billing.png",
                    alt: "Billing page with plan selection and pricing details",
                },
            ],
        },
        {
            id: "step2",
            title: "Start with trial",
            description: "Use the 14-day trial to validate workflows before paid subscription.",
            bullets: [
                "No card required to start",
                "All core features available during trial",
            ],
        },
        {
            id: "step3",
            title: "Upgrade and manage billing",
            description: "Upgrade anytime from billing settings and apply annual billing when needed.",
            bullets: [
                "Annual billing gives 2 months saving",
                "Plan changes apply immediately",
                "WhatsApp team alerts are included in all plans; you can optionally automate student messages",
                "WhatsApp Business integration uses your own number and Meta conversation charges are billed directly to institutes",
            ],
        },
    ],
    faqs: [
        {
            question: "How do I pay for my subscription?",
            answer: "Payments are processed via Razorpay using card, UPI, or net banking.",
        },
        {
            question: "Can I cancel my subscription?",
            answer: "Yes. You can cancel from billing. Access continues until the current cycle ends.",
        },
    ],
    keywords: ["billing", "plans", "trial", "subscription", "razorpay"],
};
