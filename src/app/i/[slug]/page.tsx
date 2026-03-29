import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildInstituteMetadata } from "@/app/i/[slug]/_lib/metadata";
import { getInstituteAddress, getPublicInstitute, instituteRoute } from "@/app/i/[slug]/_lib/public-institute";
import {
    CoursesGrid,
    EnquirySection,
    FacultyGrid,
    InstituteHeroSection,
    InstitutePageShell,
    LocationBlock,
    StudentPortalCard,
} from "@/modules/institute/components/public-site/InstituteWebsiteSections";

type InstituteSlugPageProps = {
    params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: InstituteSlugPageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const institute = await getPublicInstitute(slug);
        const topCourses = institute.courses.slice(0, 3).map((course) => course.name).join(", ");
        return buildInstituteMetadata({
            institute,
            description: `${institute.name || "Institute"} - ${topCourses || "Admissions open"}. Explore courses, faculty, location and contact details.`,
        });
    } catch {
        return {
            title: "Institute",
        };
    }
}

export default async function InstituteSlugPage({ params }: InstituteSlugPageProps) {
    const { slug } = await params;
    const institute = await getPublicInstitute(slug).catch(() => notFound());
    const address = getInstituteAddress(institute);
    const establishedYear = institute.createdAt ? new Date(institute.createdAt).getFullYear() : "N/A";
    const coursesPreview = institute.courses.slice(0, 6);

    return (
        <InstitutePageShell
            slug={slug}
            institute={institute}
            title="Home"
            subtitle="Hero, About Institute, Courses Preview, Faculty Preview, Location, Contact and Student Login"
        >
            <InstituteHeroSection slug={slug} institute={institute} />

            <section className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>About Institute</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>{institute.description || "Admissions open. Contact the institute for current batches and counselling."}</p>
                        <p>
                            <span className="font-medium text-foreground">Location:</span> {address || "Address available on contact page"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Institute Highlights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>Established: {establishedYear}</p>
                        <p>Courses: {institute.courses.length}</p>
                        <p>Faculty: {institute.teachers.length}</p>
                        <div className="pt-2">
                            <Button asChild size="sm">
                                <Link href={instituteRoute.courses(slug)}>Explore Courses</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Courses Preview</h3>
                    <Button asChild variant="outline" size="sm">
                        <Link href={instituteRoute.courses(slug)}>View all courses</Link>
                    </Button>
                </div>
                <CoursesGrid slug={slug} courses={coursesPreview} maxItems={6} showDescription={false} />
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Faculty Preview</h3>
                    <Button asChild variant="outline" size="sm">
                        <Link href={instituteRoute.faculty(slug)}>View all faculty</Link>
                    </Button>
                </div>
                <FacultyGrid teachers={institute.teachers} maxItems={3} />
            </section>

            <LocationBlock institute={institute} />

            <EnquirySection slug={slug} />

            <StudentPortalCard />
        </InstitutePageShell>
    );
}
