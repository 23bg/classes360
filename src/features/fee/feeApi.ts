import { z } from "zod";
import { feeRepository } from "@/features/fee/feeDataApi";
import { AppError } from "@/lib/utils/error";
import { billingService } from "@/features/billing/billingApi";
import { eventDispatcherService } from "@/lib/notifications/event-dispatcher.service";

const feePlanSchema = z.object({
    studentId: z.string().min(1),
    instituteId: z.string().min(1),
    totalAmount: z.number().min(0, "Total amount must be positive"),
    dueDate: z.string().optional(),
});

const addPaymentSchema = z.object({
    feePlanId: z.string().min(1),
    amount: z.number().min(1, "Amount must be at least 1"),
    date: z.string().optional(),
    note: z.string().trim().max(1024).optional(),
    method: z.string().trim().max(40).optional(),
    reference: z.string().trim().max(120).optional(),
});

export const feeService = {
    // Fee Plan CRUD
    async createPlan(payload: unknown) {
        const input = feePlanSchema.parse(payload);
        const created = await feeRepository.createPlan({
            studentId: input.studentId,
            instituteId: input.instituteId,
            totalAmount: input.totalAmount,
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        });

        await eventDispatcherService.dispatch({
            event: "FEE_PLAN_CREATED",
            instituteId: input.instituteId,
            studentId: input.studentId,
            message: `Fee plan created with total amount INR ${input.totalAmount}.`,
            link: `/fees/${created.id}`,
            metadata: { feePlanId: created.id, totalAmount: input.totalAmount },
        });

        return created;
    },

    async updatePlan(planId: string, instituteId: string, payload: { totalAmount?: number; dueDate?: string | null }) {
        const plan = await feeRepository.findPlanById(planId);
        if (!plan || plan.instituteId !== instituteId) {
            throw new AppError("Fee plan not found", 404, "FEE_PLAN_NOT_FOUND");
        }
        return feeRepository.updatePlan(planId, {
            totalAmount: payload.totalAmount,
            dueDate: payload.dueDate ? new Date(payload.dueDate) : payload.dueDate === null ? null : undefined,
        });
    },

    async deletePlan(planId: string, instituteId: string) {
        const plan = await feeRepository.findPlanById(planId);
        if (!plan || plan.instituteId !== instituteId) {
            throw new AppError("Fee plan not found", 404, "FEE_PLAN_NOT_FOUND");
        }
        await feeRepository.removePlan(planId);
        return { success: true };
    },

    async listPlans(instituteId: string) {
        return feeRepository.listPlansByInstitute(instituteId);
    },

    async getPlanById(planId: string, instituteId: string) {
        const plan = await feeRepository.findPlanById(planId);
        if (!plan || plan.instituteId !== instituteId) {
            throw new AppError("Fee plan not found", 404, "FEE_PLAN_NOT_FOUND");
        }
        return plan;
    },

    // Simple "Add Payment" — always PAID status
    async addPayment(payload: unknown) {
        const input = addPaymentSchema.parse(payload);
        const plan = await feeRepository.findPlanById(input.feePlanId);
        if (!plan) {
            throw new AppError("Fee plan not found", 404, "FEE_PLAN_NOT_FOUND");
        }

        await billingService.assertCanProcessPayments(plan.instituteId);

        const paidOn = input.date ? new Date(input.date) : new Date();

        const installment = await feeRepository.createInstallment({
            feePlanId: input.feePlanId,
            instituteId: plan.instituteId,
            amount: input.amount,
            status: "PAID",
            paidOn,
            note: input.note,
        });

        await feeRepository.createPaymentRecord({
            instituteId: plan.instituteId,
            studentId: plan.studentId,
            amount: input.amount,
            method: input.method,
            reference: input.reference,
            paidOn,
        });

        await eventDispatcherService.dispatch({
            event: "PAYMENT_RECEIVED",
            instituteId: plan.instituteId,
            studentId: plan.studentId,
            message: `Payment received: ₹${input.amount}`,
            link: `/payments`,
            templateEvent: "payment_received",
            templateVariables: {
                student_name: "Student",
                course_name: "Course",
            },
        });

        await eventDispatcherService.dispatch({
            event: "NEW_PAYMENT_RECORDED",
            instituteId: plan.instituteId,
            studentId: plan.studentId,
            message: `New payment recorded: INR ${input.amount}.`,
            link: "/student",
            metadata: { feePlanId: plan.id, amount: input.amount },
        });

        await eventDispatcherService.dispatch({
            event: "INSTALLMENT_ADDED",
            instituteId: plan.instituteId,
            studentId: plan.studentId,
            message: `Installment of INR ${input.amount} recorded.`,
            link: `/fees/${plan.id}`,
            metadata: { feePlanId: plan.id, installmentId: installment.id },
        });

        return installment;
    },

    // Legacy support
    async addInstallment(payload: unknown) {
        const input = z.object({
            feePlanId: z.string().min(1),
            amount: z.number().min(0),
            status: z.enum(["PENDING", "PAID", "OVERDUE"]).default("PENDING"),
        }).parse(payload);

        const plan = await feeRepository.findPlanById(input.feePlanId);
        if (!plan) {
            throw new AppError("Fee plan not found", 404, "FEE_PLAN_NOT_FOUND");
        }

        const installment = await feeRepository.createInstallment({
            feePlanId: input.feePlanId,
            instituteId: plan.instituteId,
            amount: input.amount,
            status: input.status,
        });

        await eventDispatcherService.dispatch({
            event: "INSTALLMENT_ADDED",
            instituteId: plan.instituteId,
            studentId: plan.studentId,
            message: `Installment added with amount INR ${input.amount}.`,
            link: `/fees/${plan.id}`,
            metadata: { feePlanId: plan.id, installmentId: installment.id },
        });

        return installment;
    },

    async markInstallmentPaid(instituteId: string, installmentId: string) {
        const installment = await feeRepository.findInstallmentById(installmentId);
        if (!installment || installment.instituteId !== instituteId) {
            throw new AppError("Installment not found", 404, "INSTALLMENT_NOT_FOUND");
        }

        return feeRepository.updateInstallment(installmentId, {
            status: "PAID",
            paidOn: new Date(),
        });
    },

    async updateInstallmentStatus(instituteId: string, installmentId: string, status: "PENDING" | "PAID" | "OVERDUE") {
        const installment = await feeRepository.findInstallmentById(installmentId);
        if (!installment || installment.instituteId !== instituteId) {
            throw new AppError("Installment not found", 404, "INSTALLMENT_NOT_FOUND");
        }

        return feeRepository.updateInstallment(installmentId, {
            status,
            paidOn: status === "PAID" ? new Date() : null,
        });
    },

    async listInstallments(feePlanId: string) {
        return feeRepository.listInstallmentsByPlan(feePlanId);
    },

    async deleteInstallment(instituteId: string, installmentId: string) {
        const installment = await feeRepository.findInstallmentById(installmentId);
        if (!installment || installment.instituteId !== instituteId) {
            throw new AppError("Installment not found", 404, "INSTALLMENT_NOT_FOUND");
        }

        await feeRepository.removeInstallment(installmentId);
        return { success: true };
    },

    // Student payment summary
    async getStudentPaymentSummary(instituteId: string, studentId: string) {
        const plans = await feeRepository.listPlansByStudent(instituteId, studentId);
        let totalFees = 0;
        let totalPaid = 0;

        for (const plan of plans) {
            totalFees += plan.totalAmount;
            const installments = await feeRepository.listInstallmentsByPlan(plan.id);
            for (const inst of installments) {
                if (inst.status === "PAID") {
                    totalPaid += inst.amount;
                }
            }
        }

        return {
            totalFees,
            totalPaid,
            totalPending: totalFees - totalPaid,
            plans,
        };
    },

    // Dashboard metrics
    async getFeesCollectedThisMonth(instituteId: string) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return feeRepository.totalCollectedByInstitute(instituteId, monthStart);
    },

    async getOutstandingFees(instituteId: string) {
        return feeRepository.totalOutstandingByInstitute(instituteId);
    },

    // Defaulters list
    async getDefaulters(instituteId: string) {
        return feeRepository.getDefaultersByInstitute(instituteId);
    },

    async listPayments(instituteId: string, filters: { from?: string; to?: string; studentId?: string; method?: string; limit?: number }) {
        const from = filters.from ? new Date(filters.from) : undefined;
        const to = filters.to ? new Date(filters.to) : undefined;

        return feeRepository.listPaymentsByInstitute({
            instituteId,
            from,
            to,
            studentId: filters.studentId,
            method: filters.method,
            limit: filters.limit,
        });
    },
};

