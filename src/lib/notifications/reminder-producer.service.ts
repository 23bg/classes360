import { prisma } from "@/lib/db/prisma";
import { eventDispatcherService } from "@/lib/notifications/event-dispatcher.service";

const startOfDayUtc = (now = new Date()) =>
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

export const reminderProducerService = {
    async produceFollowUpReminders() {
        const dayStart = startOfDayUtc();
        const dayEnd = addDays(dayStart, 1);

        const leads = await prisma.lead.findMany({
            where: {
                followUpAt: {
                    gte: dayStart,
                    lt: dayEnd,
                },
                deletedAt: null,
            },
            select: {
                id: true,
                instituteId: true,
                name: true,
                phone: true,
                course: true,
            },
            take: 1000,
        });

        await Promise.all(
            leads.map((lead) =>
                eventDispatcherService.dispatch({
                    event: "FOLLOW_UP_REMINDER",
                    instituteId: lead.instituteId,
                    title: "Follow-up Reminder",
                    message: `Follow-up due today for ${lead.name}.`,
                    link: `/leads/${lead.id}`,
                    whatsappPhoneNumber: undefined,
                    templateVariables: {
                        student_name: lead.name,
                        course_name: lead.course ?? "General enquiry",
                    },
                    metadata: { leadId: lead.id },
                })
            )
        );

        return { produced: leads.length };
    },

    async produceFeeDueReminders() {
        const dayStart = startOfDayUtc();
        const dayEnd = addDays(dayStart, 1);

        const feePlans = await prisma.feePlan.findMany({
            where: {
                dueDate: {
                    gte: dayStart,
                    lt: dayEnd,
                },
                deletedAt: null,
            },
            select: {
                id: true,
                instituteId: true,
                totalAmount: true,
                studentId: true,
            },
            take: 1000,
        });

        await Promise.all(
            feePlans.map((plan) =>
                eventDispatcherService.dispatch({
                    event: "FEE_DUE_REMINDER",
                    instituteId: plan.instituteId,
                    studentId: plan.studentId,
                    title: "Fee Due Reminder",
                    message: `Your fee payment is due. Amount: INR ${plan.totalAmount}.`,
                    link: "/student",
                    metadata: { feePlanId: plan.id, totalAmount: plan.totalAmount },
                })
            )
        );

        await Promise.all(
            feePlans.map((plan) =>
                eventDispatcherService.dispatch({
                    event: "FEE_DUE_SOON",
                    instituteId: plan.instituteId,
                    studentId: plan.studentId,
                    title: "Fee Due Soon",
                    message: `Fee is due soon. Amount: INR ${plan.totalAmount}.`,
                    link: "/student",
                    metadata: { feePlanId: plan.id, totalAmount: plan.totalAmount },
                })
            )
        );

        return { produced: feePlans.length };
    },

    async produceTrialEndingSoonReminders() {
        const now = new Date();
        const windowStart = addDays(now, 2);
        const windowEnd = addDays(now, 3);

        const subscriptions = await prisma.subscription.findMany({
            where: {
                status: "TRIAL",
                trialEndsAt: {
                    gte: windowStart,
                    lt: windowEnd,
                },
                deletedAt: null,
            },
            select: {
                instituteId: true,
                trialEndsAt: true,
            },
            take: 1000,
        });

        await Promise.all(
            subscriptions.map((sub) =>
                eventDispatcherService.dispatch({
                    event: "TRIAL_ENDING_SOON",
                    instituteId: sub.instituteId,
                    title: "Trial Ending Soon",
                    message: "Your Classes360 trial is ending soon. Add a payment method to avoid service interruption.",
                    link: "/billing",
                    metadata: { trialEndsAt: sub.trialEndsAt?.toISOString() },
                })
            )
        );

        return { produced: subscriptions.length };
    },
};
