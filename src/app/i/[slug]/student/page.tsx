import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildInstituteMetadata } from "@/app/i/[slug]/_lib/metadata";
import { getPublicInstitute } from "@/app/i/[slug]/_lib/public-institute";
import { InstitutePageShell, StudentPortalCard } from "@/modules/institute/components/public-site/InstituteWebsiteSections";

type InstituteStudentPageProps = {
    params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: InstituteStudentPageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const institute = await getPublicInstitute(slug);
        return buildInstituteMetadata({
            institute,
            titleSuffix: "Student Portal",
            description: `Student portal access for ${institute.name || "Institute"}. Login to access your classes and updates.`,
        });
    } catch {
        return { title: "Student Portal" };
    }
}

export default async function InstituteStudentPage({ params }: InstituteStudentPageProps) {
    const { slug } = await params;
    const institute = await getPublicInstitute(slug).catch(() => notFound());

    return (
        <InstitutePageShell
            slug={slug}
            institute={institute}
            title="Student Portal"
            subtitle="Login to access your classes and updates."
        >
            <StudentPortalCard />
        </InstitutePageShell>
    );
}
