"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudentPortal } from "@/features/studentPortal/api";

export default function StudentCoursePage() {
    const { data } = useStudentPortal();

    const schedule = data?.student?.batch?.time || data?.student?.batch?.timing;
    const faculty = data?.student?.batch?.teacherName || data?.student?.batch?.faculty;
    const liveClassLink = data?.student?.liveClassLink || data?.student?.batch?.liveClassLink;
    const recordedLecturesLink = data?.student?.recordedLecturesLink || data?.student?.batch?.recordedLecturesLink;
    const studyMaterialLink = data?.student?.studyMaterialLink || data?.student?.batch?.studyMaterialLink;

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Course</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm md:grid-cols-2">
                    <p><span className="text-muted-foreground">Course Name:</span> {data?.student?.course?.name ?? "-"}</p>
                    <p><span className="text-muted-foreground">Batch:</span> {data?.student?.batch?.name ?? "-"}</p>
                    <p><span className="text-muted-foreground">Faculty:</span> {faculty ?? "To be announced"}</p>
                    <p><span className="text-muted-foreground">Schedule:</span> {schedule ?? "To be announced"}</p>
                    <p className="md:col-span-2"><span className="text-muted-foreground">Course Description:</span> {data?.student?.course?.description ?? "Course description will be shared by your institute."}</p>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Live Class</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {liveClassLink ? (
                            <Button asChild className="w-full">
                                <a href={liveClassLink} target="_blank" rel="noreferrer">Join Live Class</a>
                            </Button>
                        ) : (
                            <p className="text-sm text-muted-foreground">Live class link not available.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Recorded Lectures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recordedLecturesLink ? (
                            <Button asChild variant="secondary" className="w-full">
                                <a href={recordedLecturesLink} target="_blank" rel="noreferrer">Open Recorded Lectures</a>
                            </Button>
                        ) : (
                            <p className="text-sm text-muted-foreground">Recorded lectures will be added soon.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Study Materials</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {studyMaterialLink ? (
                            <Button asChild variant="outline" className="w-full">
                                <a href={studyMaterialLink} target="_blank" rel="noreferrer">Open Study Materials</a>
                            </Button>
                        ) : (
                            <p className="text-sm text-muted-foreground">Study materials will be shared by institute.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Assignments (Future)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Assignments will appear here when enabled by your institute.</p>
                </CardContent>
            </Card>
        </div>
    );
}
