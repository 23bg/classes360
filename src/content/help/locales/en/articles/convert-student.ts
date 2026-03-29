import type { HelpArticle } from "@/content/help/schema";

export const convertStudentArticle: HelpArticle = {
    slug: "convert-student",
    locale: "en",
    category: "students",
    title: "Convert Enquiry to Student",
    description: "Move confirmed admissions into student records without duplicate data entry.",
    overview: "Convert only confirmed leads and attach them to the correct course and batch for clean student operations.",
    lastUpdated: "2026-03-10",
    steps: [
        {
            id: "step1",
            title: "Confirm admission readiness",
            description: "Make sure the lead is ready before conversion.",
            bullets: [
                "Confirm course and batch preference",
                "Validate contact details",
                "Capture admission date",
            ],
            screenshots: [
                {
                    src: "/help/images/convert-student/step-1.webp",
                    alt: "Lead details before student conversion",
                },
            ],
        },
        {
            id: "step2",
            title: "Convert lead and assign academics",
            description: "Assign course and batch during conversion whenever possible.",
            bullets: [
                "Set lead status to admitted",
                "Assign course",
                "Assign active batch and optional fee plan",
            ],
            screenshots: [
                {
                    src: "/help/images/convert-student/step-2.webp",
                    alt: "Lead conversion with course and batch fields",
                },
            ],
        },
        {
            id: "step3",
            title: "Continue in student lifecycle",
            description: "After conversion, manage changes in student workflows.",
            bullets: [
                "Track fees and dues",
                "Update student profile details",
                "Use student records as source of truth",
            ],
            screenshots: [
                {
                    src: "/help/images/convert-student/step-3.webp",
                    alt: "Student record page after conversion",
                },
            ],
        },
    ],
    tips: [
        "Use one admission checklist before converting to avoid cleanup work later.",
    ],
    keywords: ["convert", "lead", "student", "admission"],
    relatedSlugs: ["add-enquiry", "fees"],
    featureKey: "students",
};
