"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, IndianRupee, AlertTriangle, GraduationCap, UserPlus, Users } from "lucide-react";
import { TablePaginationControls } from "@/components/ui/table-pagination-controls";
import MetricCard from "@/components/layout/dashboard/MetricCard";
import TableWidget, { Column } from "@/components/custom/TableWidget";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchOverview, postAnnouncement } from "@/features/dashboard/dashboardSlice";

type Metrics = {
    leadsThisMonth: number;
    admissionsThisMonth: number;
    totalStudents: number;
    conversionPercentage: number;
    totalFeesCollectedThisMonth: number;
    totalOutstandingFees: number;
    todayOverview?: {
        newLeads: number;
        feesCollected: number;
        feesDueToday: number;
        newStudents: number;
    };
    recentLeads?: Array<{ id: string; name: string; phone: string; status: string; createdAt: string }>;
    recentPayments?: Array<{ id: string; amount: number; method?: string | null; paidOn: string; student: { name: string; phone: string } }>;
    followUpOverview?: {
        todayCount: number;
        overdueCount: number;
        todaysFollowUps: Array<{ id: string; name: string; phone: string; followUpAt?: string | null; status: string }>;
        overdueFollowUps: Array<{ id: string; name: string; phone: string; followUpAt?: string | null; status: string }>;
    };
};

type Defaulter = {
    studentId: string;
    studentName: string;
    phone: string;
    courseName: string;
    totalFees: number;
    totalPaid: number;
    pending: number;
    dueDate?: string | null;
};

const PAGE_SIZE = 5;

type FollowUpLead = NonNullable<Metrics["followUpOverview"]>["todaysFollowUps"][number];
type RecentLead = NonNullable<Metrics["recentLeads"]>[number];
type RecentPayment = NonNullable<Metrics["recentPayments"]>[number];

export default function DashboardPage() {
    const dispatch = useAppDispatch();
    const overview = useAppSelector((state) => state.dashboard.overview.data);
    const loading = useAppSelector((state) => state.dashboard.overview.loading);
    const postingAnnouncement = useAppSelector((state) => state.dashboard.overview.announcement.loading);
    const metrics = overview?.metrics ?? null;
    const defaulters = overview?.defaulters ?? [];
    const [announcementTitle, setAnnouncementTitle] = useState("");
    const [announcementBody, setAnnouncementBody] = useState("");
    const [todayFollowUpsPage, setTodayFollowUpsPage] = useState(1);
    const [overdueFollowUpsPage, setOverdueFollowUpsPage] = useState(1);
    const [recentLeadsPage, setRecentLeadsPage] = useState(1);
    const [recentPaymentsPage, setRecentPaymentsPage] = useState(1);
    const [defaultersPage, setDefaultersPage] = useState(1);

    useEffect(() => {
        void dispatch(fetchOverview());
    }, [dispatch]);

    const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

    useEffect(() => {
        setTodayFollowUpsPage(1);
        setOverdueFollowUpsPage(1);
        setRecentLeadsPage(1);
        setRecentPaymentsPage(1);
        setDefaultersPage(1);
    }, [metrics, defaulters.length]);

    const todayFollowUps = metrics?.followUpOverview?.todaysFollowUps ?? [];
    const overdueFollowUps = metrics?.followUpOverview?.overdueFollowUps ?? [];
    const recentLeads = metrics?.recentLeads ?? [];
    const recentPayments = metrics?.recentPayments ?? [];

    const paginatedTodayFollowUps = todayFollowUps.slice((todayFollowUpsPage - 1) * PAGE_SIZE, todayFollowUpsPage * PAGE_SIZE);
    const paginatedOverdueFollowUps = overdueFollowUps.slice((overdueFollowUpsPage - 1) * PAGE_SIZE, overdueFollowUpsPage * PAGE_SIZE);
    const paginatedRecentLeads = recentLeads.slice((recentLeadsPage - 1) * PAGE_SIZE, recentLeadsPage * PAGE_SIZE);
    const paginatedRecentPayments = recentPayments.slice((recentPaymentsPage - 1) * PAGE_SIZE, recentPaymentsPage * PAGE_SIZE);
    const paginatedDefaulters = defaulters.slice((defaultersPage - 1) * PAGE_SIZE, defaultersPage * PAGE_SIZE);

    const followUpColumns = useMemo<Column<FollowUpLead>[]>(() => [
        { header: "Name", className: "font-medium max-w-[180px] truncate", cell: (lead) => <span title={lead.name}>{lead.name}</span> },
        { header: "Phone", accessor: "phone" },
        { header: "Date", cell: (lead) => lead.followUpAt ? new Date(lead.followUpAt).toLocaleDateString() : "-" },
    ], []);

    const overdueColumns = useMemo<Column<FollowUpLead>[]>(() => [
        { header: "Name", className: "font-medium max-w-[180px] truncate", cell: (lead) => <span title={lead.name}>{lead.name}</span> },
        { header: "Phone", accessor: "phone" },
        { header: "Due", className: "text-red-600", cell: (lead) => lead.followUpAt ? new Date(lead.followUpAt).toLocaleDateString() : "-" },
    ], []);

    const recentLeadsColumns = useMemo<Column<RecentLead>[]>(() => [
        { header: "Name", className: "font-medium max-w-[180px] truncate", cell: (lead) => <span title={lead.name}>{lead.name}</span> },
        { header: "Phone", accessor: "phone" },
        { header: "Status", accessor: "status" },
    ], []);

    const recentPaymentsColumns = useMemo<Column<RecentPayment>[]>(() => [
        { header: "Student", className: "font-medium max-w-[180px] truncate", cell: (payment) => <span title={payment.student.name}>{payment.student.name}</span> },
        { header: "Amount", className: "text-right", cell: (payment) => formatCurrency(payment.amount) },
        { header: "Method", className: "max-w-[140px] truncate", cell: (payment) => <span title={payment.method || "-"}>{payment.method || "-"}</span> },
    ], []);

    const defaultersColumns = useMemo<Column<Defaulter>[]>(() => [
        { header: "Student", className: "font-medium max-w-[180px] truncate", cell: (item) => <span title={item.studentName}>{item.studentName}</span> },
        { header: "Course", className: "max-w-[180px] truncate", cell: (item) => <span title={item.courseName}>{item.courseName}</span> },
        { header: "Pending", className: "text-right font-medium text-red-600", cell: (item) => formatCurrency(item.pending) },
    ], []);

    const handlePostAnnouncement = async () => {
        if (!announcementTitle.trim() || !announcementBody.trim()) {
            toast.error("Title and message are required");
            return;
        }

        try {
            await dispatch(postAnnouncement({ title: announcementTitle, body: announcementBody })).unwrap();
            setAnnouncementTitle("");
            setAnnouncementBody("");
            toast.success("Announcement posted");
        } catch (error: any) {
            toast.error(error?.data?.error?.message ?? "Failed to post announcement");
        }
    };

    const cards = [
        { label: "Fees Collected", value: formatCurrency(metrics?.totalFeesCollectedThisMonth ?? 0), icon: IndianRupee, color: "text-emerald-600" },
        { label: "Outstanding Fees", value: formatCurrency(metrics?.totalOutstandingFees ?? 0), icon: AlertTriangle, color: "text-red-600" },
        { label: "Admissions This Month", value: metrics?.admissionsThisMonth ?? 0, icon: GraduationCap, color: "text-green-600" },
        { label: "Leads This Month", value: metrics?.leadsThisMonth ?? 0, icon: UserPlus, color: "text-blue-600" },
        { label: "Total Students", value: metrics?.totalStudents ?? 0, icon: Users, color: "text-violet-600" },
    ];

    return (
        <main className="p-6">
            <h1 className=" text-2xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Operational overview for admissions, academics, and collections.</p>

            {loading ? (
                <div className="mt-8 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <section className="mt-6 space-y-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Key Metrics</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                            {cards.map((card) => (
                                <MetricCard
                                    key={card.label}
                                    label={card.label}
                                    value={card.value}
                                    icon={card.icon}
                                    iconClassName={card.color}
                                />
                            ))}
                        </div>
                    </section>

                    <section className="mt-8 space-y-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick Actions</h2>
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                    <Button asChild variant="outline" className="justify-start">
                                        <Link href="/leads">Add Lead</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="justify-start">
                                        <Link href="/students?action=add">Add Student</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="justify-start">
                                        <Link href="/fees">Record Payment</Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                        onClick={() => document.getElementById("announcement-title")?.focus()}
                                    >
                                        Post Announcement
                                    </Button>
                                </div>

                                <div id="announcement-composer" className="rounded-lg border p-4">
                                    <p className="text-sm font-medium">Announcement Composer</p>
                                    <p className="mb-3 text-xs text-muted-foreground">Share updates with students and parents.</p>
                                    <div className="space-y-3">
                                        <Input
                                            id="announcement-title"
                                            placeholder="Announcement title"
                                            value={announcementTitle}
                                            onChange={(event) => setAnnouncementTitle(event.target.value)}
                                            maxLength={120}
                                        />
                                        <Textarea
                                            placeholder="Holiday notice, exam schedule, batch update..."
                                            value={announcementBody}
                                            onChange={(event) => setAnnouncementBody(event.target.value)}
                                            rows={3}
                                            maxLength={1000}
                                        />
                                        <div className="flex justify-end">
                                            <Button onClick={handlePostAnnouncement} disabled={postingAnnouncement}>
                                                {postingAnnouncement ? "Posting..." : "Post Announcement"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="mt-8 space-y-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today Overview</h2>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">New Leads</p>
                                        <p className="text-xl font-semibold">{metrics?.todayOverview?.newLeads ?? 0}</p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">Fees Collected Today</p>
                                        <p className="text-xl font-semibold">{formatCurrency(metrics?.todayOverview?.feesCollected ?? 0)}</p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">Fees Due Today</p>
                                        <p className="text-xl font-semibold">{metrics?.todayOverview?.feesDueToday ?? 0}</p>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-xs text-muted-foreground">New Students</p>
                                        <p className="text-xl font-semibold">{metrics?.todayOverview?.newStudents ?? 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="mt-8 space-y-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Follow-ups</h2>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Today&apos;s Follow-ups</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!todayFollowUps.length ? (
                                        <p className="text-sm text-muted-foreground">No follow-ups scheduled for today.</p>
                                    ) : (
                                        <>
                                            <TableWidget columns={followUpColumns} data={paginatedTodayFollowUps} rowKey={(lead) => lead.id} />
                                            <TablePaginationControls
                                                className="mt-3"
                                                page={todayFollowUpsPage}
                                                pageSize={PAGE_SIZE}
                                                totalItems={todayFollowUps.length}
                                                onPageChange={setTodayFollowUpsPage}
                                            />
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-red-200 bg-red-50/30 dark:bg-red-950/10">
                                <CardHeader>
                                    <CardTitle className="text-base text-red-600">Overdue Follow-ups</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!overdueFollowUps.length ? (
                                        <p className="text-sm text-muted-foreground">No overdue follow-ups.</p>
                                    ) : (
                                        <>
                                            <TableWidget columns={overdueColumns} data={paginatedOverdueFollowUps} rowKey={(lead) => lead.id} />
                                            <TablePaginationControls
                                                className="mt-3"
                                                page={overdueFollowUpsPage}
                                                pageSize={PAGE_SIZE}
                                                totalItems={overdueFollowUps.length}
                                                onPageChange={setOverdueFollowUpsPage}
                                            />
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    <section className="mt-8 space-y-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent Activity</h2>
                        <div className="grid gap-6 xl:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Recent Leads</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!recentLeads.length ? (
                                        <p className="text-sm text-muted-foreground">No recent leads yet. Share your institute link to start receiving enquiries.</p>
                                    ) : (
                                        <>
                                            <TableWidget columns={recentLeadsColumns} data={paginatedRecentLeads} rowKey={(lead) => lead.id} />
                                            <TablePaginationControls
                                                className="mt-3"
                                                page={recentLeadsPage}
                                                pageSize={PAGE_SIZE}
                                                totalItems={recentLeads.length}
                                                onPageChange={setRecentLeadsPage}
                                            />
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Recent Payments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!recentPayments.length ? (
                                        <p className="text-sm text-muted-foreground">No recent payments found.</p>
                                    ) : (
                                        <>
                                            <TableWidget columns={recentPaymentsColumns} data={paginatedRecentPayments} rowKey={(payment) => payment.id} />
                                            <TablePaginationControls
                                                className="mt-3"
                                                page={recentPaymentsPage}
                                                pageSize={PAGE_SIZE}
                                                totalItems={recentPayments.length}
                                                onPageChange={setRecentPaymentsPage}
                                            />
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                        Fee Defaulters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!defaulters.length ? (
                                        <p className="text-sm text-muted-foreground">No fee defaulters right now.</p>
                                    ) : (
                                        <>
                                            <TableWidget columns={defaultersColumns} data={paginatedDefaulters} rowKey={(item) => item.studentId} />
                                            <TablePaginationControls
                                                className="mt-3"
                                                page={defaultersPage}
                                                pageSize={PAGE_SIZE}
                                                totalItems={defaulters.length}
                                                onPageChange={setDefaultersPage}
                                            />
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}
