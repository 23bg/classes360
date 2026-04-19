import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const metadata: Metadata = {
    title: "Coaching Institutes Near You",
    description: "Discover and compare coaching institutes by city and courses.",
    alternates: {
        canonical: "/institutes",
    },
    openGraph: {
        title: "Coaching Institutes Near You",
        description: "Discover and compare coaching institutes by city and courses.",
        url: "/institutes",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Coaching Institutes Near You",
        description: "Discover and compare coaching institutes by city and courses.",
    },
};

export const revalidate = 3600;

type InstitutesPageProps = {
    searchParams: Promise<{ city?: string; course?: string; q?: string; sort?: "popular" | "newest" }>;
};

export default async function InstitutesPage({ searchParams }: InstitutesPageProps) {
    const params = await searchParams;
    const city = params.city?.trim() || "";
    const course = params.course?.trim() || "";
    const q = params.q?.trim() || "";
    const sort = params.sort === "newest" ? "newest" : "popular";

    const matchedCourseInstituteIds = course
        ? (
            await prisma.course.findMany({
                where: { name: { contains: course, mode: "insensitive" } },
                select: { instituteId: true },
            })
        ).map((item) => item.instituteId)
        : null;

    const institutes = await prisma.institute.findMany({
        where: {
            isOnboarded: true,
            slug: { not: null },
            ...(q
                ? {
                    name: {
                        contains: q,
                        mode: "insensitive",
                    },
                }
                : {}),
            ...(city
                ? {
                    address: {
                        is: {
                            city: {
                                equals: city,
                            },
                        },
                    },
                }
                : {}),
            ...(matchedCourseInstituteIds
                ? {
                    id: { in: matchedCourseInstituteIds },
                }
                : {}),
        },
        select: {
            id: true,
            slug: true,
            name: true,
            address: true,
            createdAt: true,
        },
        take: 200,
    });

    const instituteIds = institutes.map((institute) => institute.id);

    const [courseGroup, studentGroup] = instituteIds.length
        ? await Promise.all([
            prisma.course.groupBy({
                by: ["instituteId"],
                where: { instituteId: { in: instituteIds } },
                _count: { instituteId: true },
            }),
            prisma.student.groupBy({
                by: ["instituteId"],
                where: { instituteId: { in: instituteIds } },
                _count: { instituteId: true },
            }),
        ])
        : [[], []];

    const courseCountMap = new Map(courseGroup.map((row) => [row.instituteId, row._count.instituteId]));
    const studentCountMap = new Map(studentGroup.map((row) => [row.instituteId, row._count.instituteId]));

    const list = institutes
        .map((institute) => ({
            ...institute,
            courseCount: courseCountMap.get(institute.id) ?? 0,
            studentCount: studentCountMap.get(institute.id) ?? 0,
        }))
        .sort((a, b) => {
            if (sort === "newest") {
                return b.createdAt.getTime() - a.createdAt.getTime();
            }
            return (b.studentCount ?? 0) - (a.studentCount ?? 0);
        });

    return (
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Coaching Institutes Near You</h1>
                <p className="text-muted-foreground">Search, filter, and compare institutes before taking admission.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Filter by city, course, and institute name</CardDescription>
                </CardHeader>
                <CardContent>
                    <form method="GET" className="grid gap-3 md:grid-cols-4">
                        <Input placeholder="City" name="city" defaultValue={city} />
                        <Input placeholder="Course" name="course" defaultValue={course} />
                        <Input placeholder="Search institute" name="q" defaultValue={q} />
                        <div className="flex gap-2 items-end">
                            <div className="w-full">
                                <label htmlFor="sort" className="sr-only">
                                    Sort
                                </label>
                                <Select name="sort" defaultValue={sort}>
                                    <SelectTrigger id="sort" className="w-full">
                                        <SelectValue placeholder="Sort" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="popular">Popular</SelectItem>
                                        <SelectItem value="newest">Newest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit">Apply</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {list.map((institute) => (
                    <Card key={institute.id}>
                        <CardHeader>
                            <CardTitle>{institute.name || "Institute"}</CardTitle>
                            <CardDescription>{institute.address?.city || "City not set"}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm text-muted-foreground">
                            <p>Courses: {institute.courseCount}</p>
                            <p>Students: {institute.studentCount}</p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={`/i/${institute.slug}`}>View Institute</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </main>
    );
}
