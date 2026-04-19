import { DEMO_VIDEO_EMBED_URL } from "@/constants/external-links";
import type { HelpArticle } from "@/content/help/schema";

const youtubeId = DEMO_VIDEO_EMBED_URL.split("/embed/")[1]?.split("?")[0] ?? "";

export const gettingStartedArticle: HelpArticle = {
    slug: "getting-started",
    locale: "en",
    category: "gettingStarted",
    title: "Getting Started with Classes360",
    description: "Set up your institute profile, courses, and enquiry workflow in the first day.",
    overview: "This quick setup flow helps your team complete institute setup and run the first end-to-end admission process.",
    lastUpdated: "2026-03-10",
    video: youtubeId ? { youtubeId, durationSec: 60 } : undefined,
    steps: [
        {
            id: "step1",
            title: "Complete institute onboarding",
            description: "Open onboarding after signup and add your institute basics.",
            bullets: [
                "Add institute name, phone, and WhatsApp number",
                "Save city, state, and address",
                "Confirm description and social links if available",
            ],
            screenshots: [
                {
                    src: "/images/onboarding-form.png",
                    alt: "Institute onboarding form",
                },
            ],
        },
        {
            id: "step2",
            title: "Create first course and batch",
            description: "Set up your academic structure before admissions.",
            bullets: [
                "Create course with clear naming and duration",
                "Create batch for active intake",
                "Assign staff or teacher ownership",
            ],
            screenshots: [
                {
                    src: "/images/add-coures-form.png",
                    alt: "Course creation form",
                },
            ],
        },
        {
            id: "step3",
            title: "Capture and convert first enquiry",
            description: "Test the lead workflow so your team can follow the same process daily.",
            bullets: [
                "Add a first enquiry record",
                "Set follow-up and notes",
                "Convert qualified lead to student",
            ],
            screenshots: [
                {
                    src: "/images/Dashboard.png",
                    alt: "Dashboard overview with lead metrics",
                },
            ],
        },
    ],
    tips: [
        "Keep required onboarding fields minimal for faster completion.",
        "Use one source-of-truth process for lead updates across team members.",
    ],
    keywords: ["onboarding", "setup", "course", "batch", "lead conversion"],
    relatedSlugs: ["create-course", "add-enquiry", "convert-student"],
    featureKey: "onboarding",
};
