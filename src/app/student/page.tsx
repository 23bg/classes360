"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudentPortal } from "@/features/studentPortal/api";

const asCurrency = (value: number | null | undefined) => `₹${(value ?? 0).toLocaleString("en-IN")}`;

export default function StudentDashboardPage() {
    const { data } = useStudentPortal();

    const scheduleTime = data?.student?.batch?.time || data?.student?.batch?.timing;
    const teacherName = data?.student?.batch?.teacherName;
    const liveClassLink = data?.student?.liveClassLink || data?.student?.batch?.liveClassLink;
    const recordedLecturesLink = data?.student?.recordedLecturesLink;
    const studyMaterialLink = data?.student?.studyMaterialLink;

    const totalFees = data?.student?.totalFees ?? 0;
    const paidAmount = data?.student?.paidAmount ?? 0;
    const pendingAmount = data?.student?.pendingAmount ?? Math.max(0, totalFees - paidAmount);

    const latestAnnouncements = (data?.announcements ?? []).slice(0, 3);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold md:text-3xl">Student Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">Your daily learning overview in one place.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">My Course</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Course:</span> {data?.student?.course?.name ?? "-"}</p>
                        <p><span className="text-muted-foreground">Batch:</span> {data?.student?.batch?.name ?? "-"}</p>
                        <p><span className="text-muted-foreground">Duration:</span> {data?.student?.course?.duration ?? "-"}</p>
                        <p><span className="text-muted-foreground">Start Date:</span> {data?.student?.batch?.startDate ? new Date(data.student.batch.startDate).toLocaleDateString() : "-"}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {scheduleTime || teacherName || liveClassLink ? (
                            <>
                                <p><span className="text-muted-foreground">Batch Time:</span> {scheduleTime ?? "To be announced"}</p>
                                <p><span className="text-muted-foreground">Teacher Name:</span> {teacherName ?? "To be announced"}</p>
                                {liveClassLink ? (
                                    <Button asChild className="mt-2 w-full sm:w-auto">
                                        <a href={liveClassLink} target="_blank" rel="noreferrer">Join Class</a>
                                    </Button>
                                ) : (
                                    <p className="text-muted-foreground">Live class link not available.</p>
                                )}
                            </>
                        ) : (
                            <p className="text-muted-foreground">No class scheduled for today.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Online Learning Links</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {liveClassLink ? (
                            <Button asChild className="h-11">
                                <a href={liveClassLink} target="_blank" rel="noreferrer">Live Class Link</a>
                            </Button>
                        ) : (
                            <Button className="h-11" disabled>Live class link not available.</Button>
                        )}

                        {recordedLecturesLink ? (
                            <Button asChild variant="secondary" className="h-11">
                                <a href={recordedLecturesLink} target="_blank" rel="noreferrer">Recorded Lectures</a>
                            </Button>
                        ) : (
                            <Button variant="secondary" className="h-11" disabled>Recorded lectures unavailable.</Button>
                        )}

                        {studyMaterialLink ? (
                            <Button asChild variant="outline" className="h-11">
                                <a href={studyMaterialLink} target="_blank" rel="noreferrer">Study Material</a>
                            </Button>
                        ) : (
                            <Button variant="outline" className="h-11" disabled>Study material (future).</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Latest Announcements</CardTitle>
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/student/announcements">View All Announcements</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {latestAnnouncements.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No announcements yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {latestAnnouncements.map((item, index) => (
                                <div key={`${item.title}-${index}`} className="rounded-lg border p-3">
                                    <p className="font-medium">{item.title}</p>
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
                                    <p className="mt-2 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Fee Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Total Fees</p>
                            <p className="mt-1 text-xl font-semibold">{asCurrency(totalFees)}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Paid Amount</p>
                            <p className="mt-1 text-xl font-semibold text-emerald-600">{asCurrency(paidAmount)}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Pending Amount</p>
                            <p className="mt-1 text-xl font-semibold text-amber-600">{asCurrency(pendingAmount)}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Next Due Date</p>
                            <p className="mt-1 text-base font-semibold">{data?.student?.nextDueDate ? new Date(data.student.nextDueDate).toLocaleDateString() : "-"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
