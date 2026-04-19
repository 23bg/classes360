import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TableWidget, { Column } from "@/components/custom/TableWidget";

export const metadata: Metadata = {
    title: "Compare Coaching Courses Near You",
    description: "Compare coaching courses by city, duration, and fees to find the best institute near you.",
};

type CourseComparisonPageProps = {
    searchParams: Promise<{ city?: string; course?: string }>;
};

export default async function CourseComparisonPage({ searchParams }: CourseComparisonPageProps) {
    const params = await searchParams;
    const city = params.city?.trim() || "";
    const course = params.course?.trim() || "";

    const instituteWhere = {
        isOnboarded: true,
        slug: { not: null as string | null },
        ...(city
            ? {
                address: {
                    is: {
                        city: { equals: city },
                    },
                },
            }
            : {}),
    };

    const institutes = await prisma.institute.findMany({
        where: instituteWhere,
        select: {
            id: true,
            name: true,
            address: true,
        },
    });

    const instituteIds = institutes.map((institute) => institute.id);

    const courses = instituteIds.length
        ? await prisma.course.findMany({
            where: {
                instituteId: { in: instituteIds },
                ...(course
                    ? {
                        name: {
                            contains: course,
                            mode: "insensitive",
                        },
                    }
                    : {}),
            },
            select: {
                id: true,
                instituteId: true,
                name: true,
                defaultFees: true,
                duration: true,
            },
            orderBy: { createdAt: "desc" },
            take: 200,
        })
        : [];

    const instituteMap = new Map(institutes.map((institute) => [institute.id, institute]));

    const rows = courses
        .map((row) => {
            const institute = instituteMap.get(row.instituteId);
            if (!institute) return null;
            return {
                id: row.id,
                institute: institute.name || "Institute",
                course: row.name,
                fees: row.defaultFees != null ? `₹${row.defaultFees.toLocaleString("en-IN")}` : "N/A",
                duration: row.duration || "N/A",
                mode: "Offline / Hybrid",
                city: institute.address?.city || "N/A",
            };
        })
        .filter((value): value is NonNullable<typeof value> => Boolean(value));

    const columns: Column<(typeof rows)[number]>[] = [
        { header: "Institute", accessor: "institute" },
        { header: "Course", accessor: "course" },
        { header: "Fees", accessor: "fees" },
        { header: "Duration", accessor: "duration" },
        { header: "Mode", accessor: "mode" },
        { header: "City", accessor: "city" },
    ];

    return (
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Course Comparison Tool</h1>
                <p className="text-muted-foreground">Compare coaching courses between institutes.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Filter by city and course name</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" method="GET">
                        <Input name="city" placeholder="City" defaultValue={city} />
                        <Input name="course" placeholder="Course" defaultValue={course} />
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

            <Card>
                <CardHeader>
                    <CardTitle>Results</CardTitle>
                    <CardDescription>{rows.length} courses found</CardDescription>
                </CardHeader>
                <CardContent>
                    {rows.length ? (
                        <TableWidget columns={columns} data={rows} rowKey={(row) => row.id} />
                    ) : (
                        <p className="text-center text-muted-foreground">No courses found for selected filters.</p>
                    )}
                </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground">
                Run complete operations with <Link href="/features" className="text-primary underline-offset-4 hover:underline">platform features</Link> and <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">pricing plans</Link>.
            </p>
        </main>
    );
}
