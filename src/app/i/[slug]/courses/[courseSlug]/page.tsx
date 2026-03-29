import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildInstituteMetadata } from "@/app/i/[slug]/_lib/metadata";
import {
    findCourseBySlug,
    formatFees,
    getPublicInstitute,
    instituteRoute,
} from "@/app/i/[slug]/_lib/public-institute";
import {
    BatchTimings,
    EnquirySection,
    FacultyGrid,
    InstitutePageShell,
} from "@/modules/institute/components/public-site/InstituteWebsiteSections";
import Link from "next/link";

type InstituteCourseDetailsPageProps = {
    params: Promise<{ slug: string; courseSlug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: InstituteCourseDetailsPageProps): Promise<Metadata> {
    const { slug, courseSlug } = await params;

    try {
        const institute = await getPublicInstitute(slug);
        const course = findCourseBySlug(institute.courses, courseSlug);
        if (!course) {
            return { title: "Course" };
        }

        return buildInstituteMetadata({
            institute,
            titleSuffix: `${course.name} Course`,
            description: `${course.name} at ${institute.name || "Institute"}. Duration: ${course.duration || "N/A"}, fees: ${formatFees(course.defaultFees)}.`,
        });
    } catch {
        return { title: "Course" };
    }
}

export default async function InstituteCourseDetailsPage({ params }: InstituteCourseDetailsPageProps) {
    const { slug, courseSlug } = await params;
    const institute = await getPublicInstitute(slug).catch(() => notFound());
    const course = findCourseBySlug(institute.courses, courseSlug);

    if (!course) {
        notFound();
    }

    const relatedBatches = institute.batches.filter((batch) => batch.courseId === course.id);

    return (
        <InstitutePageShell
            slug={slug}
            institute={institute}
            title={course.name}
            subtitle="Course details, batch timings, faculty and enquiry"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{course.name}</CardTitle>
                    <CardDescription>{course.description || "Detailed counselling will be shared during enquiry."}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
                    <p>Duration: {course.duration || "N/A"}</p>
                    <p>Fees: {formatFees(course.defaultFees)}</p>
                    <p>Batch Timings: {relatedBatches.length ? "Available below" : "Shared on enquiry"}</p>
                    <p>Faculty: {institute.teachers.length ? "Available" : "Details coming soon"}</p>
                    <p className="md:col-span-2">Course Curriculum: {course.description || "Will be shared by institute counsellor."}</p>
                    <div className="md:col-span-2 flex gap-2">
                        <Button asChild>
                            <Link href={instituteRoute.contact(slug)}>Enquiry</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={instituteRoute.courses(slug)}>Back to courses</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <section className="space-y-3">
                <h3 className="text-xl font-semibold">Batch Timings</h3>
                <BatchTimings batches={relatedBatches} />
            </section>

            <section className="space-y-3">
                <h3 className="text-xl font-semibold">Faculty</h3>
                <FacultyGrid teachers={institute.teachers} maxItems={3} />
            </section>

            <EnquirySection slug={slug} />
        </InstitutePageShell>
    );
}
