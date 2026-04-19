import type { HelpArticle } from "@/content/help/schema";

export const createCourseArticle: HelpArticle = {
    slug: "create-course",
    locale: "en",
    category: "coursesAndBatches",
    title: "Create Courses and Batches",
    description: "Set up your academic structure for admissions and operations.",
    overview: "Create consistent course and batch records so admissions and student management stay aligned.",
    lastUpdated: "2026-03-10",
    steps: [
        {
            id: "step1",
            title: "Create your first course",
            description: "Start with core offerings that drive admissions.",
            bullets: [
                "Use clear course naming like NEET Foundation 2026",
                "Add duration and optional default fee",
                "Add description or banner for public page",
            ],
            screenshots: [
                {
                    src: "/images/add-coures-form.png",
                    alt: "Course creation form in dashboard",
                },
            ],
        },
        {
            id: "step2",
            title: "Create a batch for intake",
            description: "Batches represent actual admission intakes and schedules.",
            bullets: [
                "Set batch name and start date",
                "Attach schedule information",
                "Assign teacher where needed",
            ],
            screenshots: [
                {
                    src: "/images/add-coures-form.png",
                    alt: "Batch creation form linked to course",
                },
            ],
        },
        {
            id: "step3",
            title: "Map students to course and batch",
            description: "Ensure every admission has proper academic mapping.",
            bullets: [
                "Assign course in student profile",
                "Assign correct active batch",
                "Review mapping weekly",
            ],
            screenshots: [
                {
                    src: "/images/empty-student-list.png",
                    alt: "Student list empty state with course and batch assignment",
                },
            ],
        },
    ],
    tips: [
        "Keep naming conventions consistent across years and centers.",
    ],
    keywords: ["course", "batch", "admission", "academic structure"],
    relatedSlugs: ["getting-started", "convert-student"],
    featureKey: "courses",
};
