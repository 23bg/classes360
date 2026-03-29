import type { HelpArticle } from "@/content/help/schema";

export const feesArticle: HelpArticle = {
    slug: "fees",
    locale: "en",
    category: "feesAndBilling",
    title: "Managing Student Fees",
    description: "Record fee plans, installments, and payment receipts for enrolled students.",
    overview: "Classes360 tracks fees manually recorded by your team. It does not collect student payments directly.",
    lastUpdated: "2026-06-01",
    steps: [
        {
            id: "step1",
            title: "Create fee plan",
            description: "Define total fees and installment structure for each student.",
            bullets: [
                "Open student profile",
                "Add total amount",
                "Split installments with due dates",
            ],
            screenshots: [
                {
                    src: "/help/images/fees/step-1.webp",
                    alt: "Fee plan creation with installment setup",
                },
            ],
        },
        {
            id: "step2",
            title: "Record payment",
            description: "Capture each payment with date and mode.",
            bullets: [
                "Open fee record",
                "Mark installment paid with amount",
                "Add mode such as cash, UPI, or bank transfer",
            ],
            screenshots: [
                {
                    src: "/help/images/fees/step-2.webp",
                    alt: "Payment entry screen for student fee",
                },
            ],
        },
        {
            id: "step3",
            title: "Monitor pending dues",
            description: "Use fee views to track overdue and upcoming dues.",
            bullets: [
                "Review due list daily",
                "Follow up with students having pending installments",
                "Track collection trends by batch",
            ],
            screenshots: [
                {
                    src: "/help/images/fees/step-3.webp",
                    alt: "Outstanding dues view in fees module",
                },
            ],
        },
    ],
    faqs: [
        {
            question: "Does Classes360 collect student payments?",
            answer: "No. Classes360 does not process or transfer student money. Your team records payments after collection.",
        },
        {
            question: "Can I add partial payments?",
            answer: "Yes. You can record partial amounts against installments and continue later.",
        },
    ],
    keywords: ["fees", "installments", "payment", "dues"],
    featureKey: "fees",
};
