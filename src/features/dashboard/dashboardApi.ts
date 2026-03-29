import { prisma } from "@/lib/db/prisma";
import { feeRepository } from "@/features/fee/feeDataApi";

const parseAggregateCount = (value: unknown) => {
    if (!Array.isArray(value)) return 0;
    const first = value[0];
    if (!first || typeof first !== "object") return 0;
    const count = (first as { count?: unknown }).count;
    return typeof count === "number" ? count : Number(count ?? 0);
};

export const dashboardService = {
    async getMetrics(instituteId: string) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const [
            leadsAgg,
            admissionsAgg,
            studentsAgg,
            feesCollected,
            outstandingFees,
            leadsTodayAgg,
            studentsTodayAgg,
            feesCollectedToday,
            feesDueToday,
            recentLeads,
            recentPayments,
            todaysFollowUps,
            overdueFollowUps,
        ] = await Promise.all([
            prisma.lead.aggregateRaw({
                pipeline: [
                    {
                        $match: {
                            instituteId,
                            createdAt: { $gte: monthStart },
                        },
                    },
                    { $count: "count" },
                ],
            }),
            prisma.lead.aggregateRaw({
                pipeline: [
                    {
                        $match: {
                            instituteId,
                            status: "ADMITTED",
                            updatedAt: { $gte: monthStart },
                        },
                    },
                    { $count: "count" },
                ],
            }),
            prisma.student.aggregateRaw({
                pipeline: [
                    {
                        $match: {
                            instituteId,
                        },
                    },
                    { $count: "count" },
                ],
            }),
            feeRepository.totalCollectedByInstitute(instituteId, monthStart),
            feeRepository.totalOutstandingByInstitute(instituteId),
            prisma.lead.aggregateRaw({
                pipeline: [
                    {
                        $match: {
                            instituteId,
                            createdAt: { $gte: todayStart, $lt: tomorrowStart },
                        },
                    },
                    { $count: "count" },
                ],
            }),
            prisma.student.aggregateRaw({
                pipeline: [
                    {
                        $match: {
                            instituteId,
                            createdAt: { $gte: todayStart, $lt: tomorrowStart },
                        },
                    },
                    { $count: "count" },
                ],
            }),
            feeRepository.totalCollectedByInstitute(instituteId, todayStart),
            feeRepository.countFeesDueOnDate(instituteId, todayStart, tomorrowStart),
            prisma.lead.findMany({
                where: { instituteId },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    status: true,
                    createdAt: true,
                },
            }),
            feeRepository.listPaymentsByInstitute({ instituteId, limit: 5 }),
            prisma.lead.findMany({
                where: {
                    instituteId,
                    followUpAt: { gte: todayStart, lt: tomorrowStart },
                    status: { notIn: ["ADMITTED", "DROPPED"] },
                },
                orderBy: { followUpAt: "asc" },
                take: 20,
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    followUpAt: true,
                    status: true,
                },
            }),
            prisma.lead.findMany({
                where: {
                    instituteId,
                    followUpAt: { lt: todayStart },
                    status: { notIn: ["ADMITTED", "DROPPED"] },
                },
                orderBy: { followUpAt: "asc" },
                take: 20,
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    followUpAt: true,
                    status: true,
                },
            }),
        ]);

        const leadsThisMonth = parseAggregateCount(leadsAgg);
        const admissionsThisMonth = parseAggregateCount(admissionsAgg);
        const totalStudents = parseAggregateCount(studentsAgg);
        const leadsToday = parseAggregateCount(leadsTodayAgg);
        const studentsToday = parseAggregateCount(studentsTodayAgg);

        const conversionPercentage = leadsThisMonth > 0 ? Math.round((admissionsThisMonth / leadsThisMonth) * 100) : 0;

        return {
            leadsThisMonth,
            admissionsThisMonth,
            totalStudents,
            conversionPercentage,
            totalFeesCollectedThisMonth: feesCollected,
            totalOutstandingFees: outstandingFees,
            todayOverview: {
                newLeads: leadsToday,
                feesCollected: feesCollectedToday,
                feesDueToday,
                newStudents: studentsToday,
            },
            recentLeads,
            recentPayments,
            followUpOverview: {
                todayCount: todaysFollowUps.length,
                overdueCount: overdueFollowUps.length,
                todaysFollowUps,
                overdueFollowUps,
            },
        };
    },
};

