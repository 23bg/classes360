import { DEMO_VIDEO_EMBED_URL } from "@/constants/external-links";
import type { HelpArticle } from "@/content/help/schema";

const youtubeId = DEMO_VIDEO_EMBED_URL.split("/embed/")[1]?.split("?")[0] ?? "";

export const addEnquiryArticle: HelpArticle = {
    slug: "add-enquiry",
    locale: "en",
    category: "managingEnquiries",
    title: "How to Add an Enquiry",
    description: "Capture new leads quickly and keep follow-ups organized.",
    overview: "Use this guide to create structured lead records and maintain clean follow-up workflows.",
    lastUpdated: "2026-03-10",
    video: youtubeId ? { youtubeId, durationSec: 55 } : undefined,
    steps: [
        {
            id: "step1",
            title: "Open Leads and create enquiry",
            description: "Go to the Leads section and click add enquiry.",
            bullets: [
                "Enter lead name and phone",
                "Set interested course",
                "Capture source like walk-in, call, or campaign",
            ],
            screenshots: [
                {
                    src: "/images/empty-lead.png",
                    alt: "Leads screen empty state with add lead action",
                },
            ],
        },
        {
            id: "step2",
            title: "Set follow-up details",
            description: "Track what happens next so no lead gets missed.",
            bullets: [
                "Choose follow-up date",
                "Save counselor notes",
                "Use status consistently",
            ],
            screenshots: [
                {
                    src: "/images/import-lead-form.png",
                    alt: "Lead entry form for follow-up details",
                },
            ],
        },
        {
            id: "step3",
            title: "Review and prioritize pipeline",
            description: "Daily hygiene keeps your conversion predictable.",
            bullets: [
                "Close inactive leads with reasons",
                "Prioritize hot leads first",
                "Track stage-wise conversion weekly",
            ],
            screenshots: [
                {
                    src: "/images/Dashboard.png",
                    alt: "Dashboard overview with lead metrics and statuses",
                },
            ],
        },
    ],
    tips: [
        "Phone number should be treated as the primary dedupe identifier.",
        "Always add next action notes after each call.",
    ],
    keywords: ["enquiry", "lead", "follow-up", "counselor"],
    relatedSlugs: ["convert-student", "getting-started"],
    featureKey: "leads",
};
