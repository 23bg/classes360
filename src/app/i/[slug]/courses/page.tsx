import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildInstituteMetadata } from "@/app/i/[slug]/_lib/metadata";
import { getPublicInstitute } from "@/app/i/[slug]/_lib/public-institute";
import { CoursesGrid, InstitutePageShell } from "@/modules/institute/components/public-site/InstituteWebsiteSections";

type InstituteCoursesPageProps = {
    params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: InstituteCoursesPageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const institute = await getPublicInstitute(slug);
        return buildInstituteMetadata({
            institute,
            titleSuffix: "Courses",
            description: `Browse all courses offered by ${institute.name || "this institute"}. Compare duration, fees, and syllabus details.`,
        });
    } catch {
        return { title: "Courses" };
    }
}

export default async function InstituteCoursesPage({ params }: InstituteCoursesPageProps) {
    const { slug } = await params;
    const institute = await getPublicInstitute(slug).catch(() => notFound());

    return (
        <InstitutePageShell
            slug={slug}
            institute={institute}
            title="Courses"
            subtitle="Explore all courses offered by the institute"
        >
            <CoursesGrid slug={slug} courses={institute.courses} showDescription />
        </InstitutePageShell>
    );
}
