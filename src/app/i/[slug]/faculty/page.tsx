import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildInstituteMetadata } from "@/app/i/[slug]/_lib/metadata";
import { getPublicInstitute } from "@/app/i/[slug]/_lib/public-institute";
import { FacultyGrid, InstitutePageShell } from "@/modules/institute/components/public-site/InstituteWebsiteSections";

type InstituteFacultyPageProps = {
    params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: InstituteFacultyPageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const institute = await getPublicInstitute(slug);
        return buildInstituteMetadata({
            institute,
            titleSuffix: "Faculty",
            description: `Meet the faculty team at ${institute.name || "Institute"}. View subjects and teaching profiles.`,
        });
    } catch {
        return { title: "Faculty" };
    }
}

export default async function InstituteFacultyPage({ params }: InstituteFacultyPageProps) {
    const { slug } = await params;
    const institute = await getPublicInstitute(slug).catch(() => notFound());

    return (
        <InstitutePageShell
            slug={slug}
            institute={institute}
            title="Faculty"
            subtitle="Subject experts and teaching mentors"
        >
            <FacultyGrid teachers={institute.teachers} />
        </InstitutePageShell>
    );
}
