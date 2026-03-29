import { prisma } from "@/lib/db/prisma";

type CreateFeePlanInput = {
    studentId: string;
    instituteId: string;
    totalAmount: number;
    dueDate?: Date;
};

type CreateInstallmentInput = {
    feePlanId: string;
    instituteId: string;
    amount: number;
    status: "PENDING" | "PAID" | "OVERDUE";
    paidOn?: Date;
    note?: string;
};

export const feeRepository = {
    // Fee Plan operations
    createPlan: async (payload: CreateFeePlanInput) =>
        prisma.feePlan.create({ data: payload }),

    findPlanById: async (planId: string) =>
        prisma.feePlan.findUnique({ where: { id: planId } }),

    listPlansByInstitute: async (instituteId: string) =>
        prisma.feePlan.findMany({
            where: { instituteId },
            orderBy: { createdAt: "desc" },
        }),

    listPlansByStudent: async (instituteId: string, studentId: string) =>
        prisma.feePlan.findMany({
            where: { instituteId, studentId },
            orderBy: { createdAt: "desc" },
        }),

    updatePlan: async (planId: string, data: { totalAmount?: number; dueDate?: Date | null }) =>
        prisma.feePlan.update({
            where: { id: planId },
            data,
        }),

    removePlan: async (planId: string) =>
        prisma.feePlan.delete({ where: { id: planId } }),

    // Installment / Payment operations
    createInstallment: async (payload: CreateInstallmentInput) =>
        prisma.feeInstallment.create({ data: payload }),

    createPaymentRecord: async (payload: {
        instituteId: string;
        studentId: string;
        amount: number;
        method?: string;
        reference?: string;
        paidOn?: Date;
    }) =>
        prisma.payment.create({
            data: {
                instituteId: payload.instituteId,
                studentId: payload.studentId,
                amount: payload.amount,
                method: payload.method,
                reference: payload.reference,
                paidOn: payload.paidOn ?? new Date(),
            },
        }),

    listInstallmentsByPlan: async (feePlanId: string) =>
        prisma.feeInstallment.findMany({
            where: { feePlanId },
            orderBy: { paidOn: "desc" },
        }),

    findInstallmentById: async (installmentId: string) =>
        prisma.feeInstallment.findUnique({
            where: { id: installmentId },
        }),

    updateInstallment: async (installmentId: string, data: { status?: "PENDING" | "PAID" | "OVERDUE"; paidOn?: Date | null; amount?: number; note?: string }) =>
        prisma.feeInstallment.update({
            where: { id: installmentId },
            data,
        }),

    removeInstallment: async (installmentId: string) =>
        prisma.feeInstallment.delete({ where: { id: installmentId } }),

    // Aggregations for dashboard
    totalCollectedByInstitute: async (instituteId: string, since?: Date) => {
        const plans = await prisma.feePlan.findMany({
            where: { instituteId },
            select: { id: true },
        });
        const planIds = plans.map((p) => p.id);
        if (planIds.length === 0) return 0;

        const result = await prisma.feeInstallment.aggregate({
            where: {
                feePlanId: { in: planIds },
                status: "PAID",
                ...(since ? { paidOn: { gte: since } } : {}),
            },
            _sum: { amount: true },
        });
        return result._sum.amount ?? 0;
    },

    totalOutstandingByInstitute: async (instituteId: string) => {
        // Outstanding = sum of all plan totalAmounts - sum of all PAID installments
        const plans = await prisma.feePlan.findMany({
            where: { instituteId },
            select: { id: true, totalAmount: true },
        });
        if (plans.length === 0) return 0;

        const totalAssigned = plans.reduce((s, p) => s + p.totalAmount, 0);
        const planIds = plans.map((p) => p.id);

        const paidResult = await prisma.feeInstallment.aggregate({
            where: {
                feePlanId: { in: planIds },
                status: "PAID",
            },
            _sum: { amount: true },
        });
        const totalPaid = paidResult._sum.amount ?? 0;
        return Math.max(0, totalAssigned - totalPaid);
    },

    // Defaulters: students whose FeePlan totalAmount > sum of PAID installments
    getDefaultersByInstitute: async (instituteId: string) => {
        const plans = await prisma.feePlan.findMany({
            where: { instituteId },
            select: { id: true, studentId: true, totalAmount: true, dueDate: true },
        });
        if (plans.length === 0) return [];

        const planIds = plans.map((p) => p.id);

        // Get all PAID installments for these plans grouped
        const payments = await prisma.feeInstallment.findMany({
            where: { feePlanId: { in: planIds }, status: "PAID" },
            select: { feePlanId: true, amount: true },
        });

        // Sum payments by plan
        const paidByPlan: Record<string, number> = {};
        for (const p of payments) {
            paidByPlan[p.feePlanId] = (paidByPlan[p.feePlanId] ?? 0) + p.amount;
        }

        // Find plans with pending > 0 and aggregate by student
        const aggregatedByStudent: Record<string, {
            studentId: string;
            totalAmount: number;
            totalPaid: number;
            pending: number;
            dueDate: Date | null;
        }> = {};

        for (const plan of plans) {
            const totalPaid = paidByPlan[plan.id] ?? 0;
            const pending = plan.totalAmount - totalPaid;
            if (pending <= 0) continue;

            const existing = aggregatedByStudent[plan.studentId];
            if (!existing) {
                aggregatedByStudent[plan.studentId] = {
                    studentId: plan.studentId,
                    totalAmount: plan.totalAmount,
                    totalPaid,
                    pending,
                    dueDate: plan.dueDate,
                };
                continue;
            }

            existing.totalAmount += plan.totalAmount;
            existing.totalPaid += totalPaid;
            existing.pending += pending;
            if (plan.dueDate && (!existing.dueDate || plan.dueDate < existing.dueDate)) {
                existing.dueDate = plan.dueDate;
            }
        }

        const defaulterPlans = Object.values(aggregatedByStudent);

        // Get student details
        const studentIds = [...new Set(defaulterPlans.map((d) => d.studentId))];
        const students = await prisma.student.findMany({
            where: { id: { in: studentIds } },
            select: { id: true, name: true, phone: true, courseId: true },
        });
        const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));

        // Get course names for students
        const courseIds = students.map((s) => s.courseId).filter(Boolean) as string[];
        const courses = courseIds.length > 0
            ? await prisma.course.findMany({
                where: { id: { in: courseIds } },
                select: { id: true, name: true },
            })
            : [];
        const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.name]));

        return defaulterPlans.map((d) => {
            const student = studentMap[d.studentId];
            return {
                studentId: d.studentId,
                studentName: student?.name ?? "Unknown",
                phone: student?.phone ?? "",
                courseName: student?.courseId ? (courseMap[student.courseId] ?? "-") : "-",
                totalFees: d.totalAmount,
                totalPaid: d.totalPaid,
                pending: d.pending,
                dueDate: d.dueDate,
            };
        });
    },

    listPaymentsByInstitute: async (input: {
        instituteId: string;
        from?: Date;
        to?: Date;
        studentId?: string;
        method?: string;
        limit?: number;
    }) => {
        const payments = await prisma.payment.findMany({
            where: {
                instituteId: input.instituteId,
                ...(input.studentId ? { studentId: input.studentId } : {}),
                ...(input.method ? { method: { equals: input.method, mode: "insensitive" } } : {}),
                ...(input.from || input.to
                    ? {
                        paidOn: {
                            ...(input.from ? { gte: input.from } : {}),
                            ...(input.to ? { lte: input.to } : {}),
                        },
                    }
                    : {}),
            },
            orderBy: { paidOn: "desc" },
            ...(input.limit ? { take: input.limit } : {}),
        });

        const studentIds = [...new Set(payments.map((payment) => payment.studentId))];
        const students = studentIds.length
            ? await prisma.student.findMany({
                where: { id: { in: studentIds }, instituteId: input.instituteId },
                select: { id: true, name: true, phone: true },
            })
            : [];
        const studentMap = Object.fromEntries(students.map((student) => [student.id, student]));

        return payments.map((payment) => ({
            ...payment,
            student: studentMap[payment.studentId] ?? {
                id: payment.studentId,
                name: "Unknown",
                phone: "",
            },
        }));
    },

    countFeesDueOnDate: async (instituteId: string, start: Date, end: Date) => {
        const plans = await prisma.feePlan.findMany({
            where: {
                instituteId,
                dueDate: {
                    gte: start,
                    lt: end,
                },
            },
            select: {
                id: true,
                totalAmount: true,
            },
        });

        if (plans.length === 0) return 0;

        const planIds = plans.map((p) => p.id);
        const payments = await prisma.feeInstallment.findMany({
            where: {
                feePlanId: { in: planIds },
                status: "PAID",
            },
            select: { feePlanId: true, amount: true },
        });

        const paidByPlan: Record<string, number> = {};
        for (const payment of payments) {
            paidByPlan[payment.feePlanId] = (paidByPlan[payment.feePlanId] ?? 0) + payment.amount;
        }

        return plans.filter((plan) => (plan.totalAmount - (paidByPlan[plan.id] ?? 0)) > 0).length;
    },
};
