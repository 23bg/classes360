import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { withTenantScope } from "@/lib/db/tenant-scope";
import { studentService } from "@/server/studentsApi";
import { instituteRepository } from "@/features/institute/instituteDataApi";
import { AppError } from "@/lib/utils/error";
import { billingService } from "@/features/billing/billingApi";
import { eventDispatcherService } from "@/lib/notifications/event-dispatcher.service";
import { logger } from "@/lib/utils/logger";

export type LeadActivityType =
    | "LEAD_CREATED"
    | "STATUS_CHANGED"
    | "NOTE_ADDED"
    | "FOLLOWUP_SCHEDULED"
    | "FOLLOWUP_COMPLETED"
    | "ASSIGNED_USER_CHANGED"
    | "CONVERTED_TO_STUDENT";

type CreateLeadInput = {
    instituteId: string;
    name: string;
    phone: string;
    email?: string;
    source?: string;
    course?: string;
    message?: string;
    followUpAt?: Date;
    status?: string;
};

type ListLeadInput = {
    instituteId: string;
    status?: string;
    query?: string;
    from?: Date;
    to?: Date;
};

type LeadActivityEntry = {
    leadId: string;
    instituteId: string;
    activityType: LeadActivityType;
    title: string;
    description?: string;
    actorUserId?: string;
    createdAt: Date;
};

const createLeadRecord = async (payload: CreateLeadInput) =>
    prisma.lead.create({
        data: {
            instituteId: payload.instituteId,
            name: payload.name,
            phone: payload.phone,
            email: payload.email,
            source: payload.source,
            course: payload.course,
            message: payload.message,
            followUpAt: payload.followUpAt,
            status: payload.status ?? "NEW",
        },
    });

const bulkCreateLeadRecords = async (rows: CreateLeadInput[]) =>
    prisma.lead.createMany({
        data: rows.map((payload) => ({
            instituteId: payload.instituteId,
            name: payload.name,
            phone: payload.phone,
            email: payload.email,
            source: payload.source,
            course: payload.course,
            message: payload.message,
            followUpAt: payload.followUpAt,
            status: payload.status ?? "NEW",
        })),
    });

const findLeadByPhoneInInstitute = async (instituteId: string, phone: string) =>
    prisma.lead.findFirst({
        where: withTenantScope(instituteId, { phone }),
    });

const findLeadByIdInInstitute = async (instituteId: string, leadId: string) =>
    prisma.lead.findFirst({
        where: withTenantScope(instituteId, { id: leadId }),
    });

const updateLeadStatusRecord = async (instituteId: string, leadId: string, status: string) =>
    prisma.lead.updateMany({
        where: { id: leadId, instituteId },
        data: { status },
    });

const updateLeadByIdInInstitute = async (
    instituteId: string,
    leadId: string,
    payload: { message?: string | null; followUpAt?: Date | null; status?: string }
) =>
    prisma.lead.updateMany({
        where: { id: leadId, instituteId },
        data: {
            ...(payload.message !== undefined ? { message: payload.message } : {}),
            ...(payload.followUpAt !== undefined ? { followUpAt: payload.followUpAt } : {}),
            ...(payload.status !== undefined ? { status: payload.status } : {}),
        },
    });

const listLeadRecords = async (input: ListLeadInput) =>
    prisma.lead.findMany({
        where: {
            ...withTenantScope(input.instituteId),
            ...(input.status ? { status: input.status } : {}),
            ...(input.query
                ? {
                    OR: [
                        { name: { contains: input.query, mode: "insensitive" } },
                        { phone: { contains: input.query, mode: "insensitive" } },
                        { email: { contains: input.query, mode: "insensitive" } },
                        { course: { contains: input.query, mode: "insensitive" } },
                    ],
                }
                : {}),
            ...(input.from || input.to
                ? {
                    createdAt: {
                        ...(input.from ? { gte: input.from } : {}),
                        ...(input.to ? { lte: input.to } : {}),
                    },
                }
                : {}),
        },
        orderBy: { createdAt: "desc" },
    });

const logLeadActivity = async (entry: Omit<LeadActivityEntry, "createdAt"> & { createdAt?: Date }) => {
    const createdAt = entry.createdAt ?? new Date();
    const updated = await prisma.lead.updateMany({
        where: { id: entry.leadId, instituteId: entry.instituteId },
        data: {
            activities: {
                push: {
                    activityType: entry.activityType,
                    title: entry.title,
                    description: entry.description,
                    actorUserId: entry.actorUserId,
                    createdAt,
                },
            },
        },
    });

    if (updated.count === 0) {
        logger.warn("lead activity logging skipped: lead not found for embedded activity push");
    }
};

const listLeadActivities = async (instituteId: string, leadId: string) => {
    const lead = await prisma.lead.findFirst({
        where: { id: leadId, instituteId },
        select: {
            id: true,
            instituteId: true,
            activities: true,
        },
    });

    if (!lead) return [];

    return (lead.activities ?? [])
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 100)
        .map((row) => ({
            leadId: lead.id,
            instituteId: lead.instituteId,
            activityType: row.activityType as LeadActivityType,
            title: row.title,
            description: row.description,
            actorUserId: row.actorUserId,
            createdAt: row.createdAt.toISOString(),
        }));
};

const leadImportRowSchema = z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().trim().max(120).email().optional(),
    source: z.string().trim().max(80).optional(),
    course: z.string().trim().max(120).optional(),
    city: z.string().trim().max(80).optional(),
    message: z.string().trim().max(1024).optional(),
});

const leadInputSchema = z.object({
    instituteId: z.string().min(1),
    name: z.string().trim().min(2).max(80),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().trim().max(120).email().optional(),
    source: z.string().trim().max(80).optional(),
    course: z.string().trim().max(120).optional(),
    message: z.string().trim().max(1024).optional(),
    followUpAt: z.string().optional(),
});

const listInputSchema = z.object({
    status: z.string().optional(),
    query: z.string().trim().max(120).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
});

export const leadActivityService = {
    log: logLeadActivity,
    listByLead: listLeadActivities,
};

export const leadService = {
    async createLead(payload: unknown) {
        const input = leadInputSchema.parse(payload);
        await billingService.assertCanCreateLeads(input.instituteId);
        const duplicate = await findLeadByPhoneInInstitute(input.instituteId, input.phone);
        if (duplicate) {
            throw new AppError("Lead already exists with this mobile number", 409, "DUPLICATE_LEAD", {
                existingLeadId: duplicate.id,
                existingPhone: duplicate.phone,
            });
        }

        const created = await createLeadRecord({
            ...input,
            followUpAt: input.followUpAt ? new Date(input.followUpAt) : undefined,
            status: "NEW",
        });

        await logLeadActivity({
            leadId: created.id,
            instituteId: created.instituteId,
            activityType: "LEAD_CREATED",
            title: "Lead created",
        });

        if (created.followUpAt) {
            await logLeadActivity({
                leadId: created.id,
                instituteId: created.instituteId,
                activityType: "FOLLOWUP_SCHEDULED",
                title: "Follow-up scheduled",
                description: `Next follow-up on ${created.followUpAt.toISOString().slice(0, 10)}`,
            });
        }

        await eventDispatcherService.dispatch({
            event: "LEAD_CREATED",
            instituteId: created.instituteId,
            message: `New enquiry received: ${created.name} (${created.phone}).`,
            link: `/leads/${created.id}`,
            metadata: { leadId: created.id },
            whatsappPhoneNumber: created.phone,
            templateEvent: "new_enquiry_alert",
            templateVariables: {
                student_name: created.name,
                course_name: created.course ?? "General enquiry",
            },
        });

        return created;
    },

    async createLeadBySlug(
        slug: string,
        payload: {
            name: string;
            phone: string;
            email?: string;
            source?: string;
            course?: string;
            message?: string;
        }
    ) {
        const institute = await instituteRepository.findBySlug(slug);
        if (!institute) {
            throw new AppError("Institute not found", 404, "INSTITUTE_NOT_FOUND");
        }

        return this.createLead({
            instituteId: institute.id,
            ...payload,
        });
    },

    async updateStatus(instituteId: string, leadId: string, status: string) {
        const beforeUpdate = await findLeadByIdInInstitute(instituteId, leadId);
        if (!beforeUpdate) {
            throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
        }

        await updateLeadStatusRecord(instituteId, leadId, status);
        const updated = await findLeadByIdInInstitute(instituteId, leadId);

        if (!updated) {
            throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
        }

        if (beforeUpdate.status !== status) {
            await logLeadActivity({
                leadId: updated.id,
                instituteId,
                activityType: "STATUS_CHANGED",
                title: "Status changed",
                description: `${beforeUpdate.status} → ${status}`,
            });

            await eventDispatcherService.dispatch({
                event: "LEAD_STATUS_CHANGED",
                instituteId,
                message: `${updated.name} status changed from ${beforeUpdate.status} to ${status}.`,
                link: `/leads/${updated.id}`,
                metadata: { leadId: updated.id, previousStatus: beforeUpdate.status, status },
            });
        }

        if (status === "ADMITTED") {
            const duplicate = await studentService.findStudentByPhoneInInstitute(instituteId, updated.phone);
            if (duplicate) {
                throw new AppError("Student already exists with this phone", 409, "DUPLICATE_STUDENT");
            }

            await studentService.createStudentRecord({
                instituteId,
                name: updated.name,
                phone: updated.phone,
                email: updated.email ?? undefined,
            });

            await logLeadActivity({
                leadId: updated.id,
                instituteId,
                activityType: "CONVERTED_TO_STUDENT",
                title: "Converted to student",
            });

            await eventDispatcherService.dispatch({
                event: "LEAD_CONVERTED_TO_STUDENT",
                instituteId,
                message: `Lead converted to student: ${updated.name} (${updated.phone}).`,
                link: `/students`,
                whatsappPhoneNumber: updated.phone,
                metadata: { leadId: updated.id },
                templateEvent: "admission_confirmed",
                templateVariables: {
                    student_name: updated.name,
                    course_name: updated.course ?? "Course",
                },
            });
        }

        return updated;
    },

    async updateLeadStatus(instituteId: string, leadId: string, status: string) {
        return this.updateStatus(instituteId, leadId, status);
    },

    async updateLead(
        instituteId: string,
        leadId: string,
        payload: { status?: string; message?: string | null; followUpAt?: string | null }
    ) {
        if (!payload.status && payload.message === undefined && payload.followUpAt === undefined) {
            throw new AppError("Nothing to update", 400, "INVALID_UPDATE");
        }

        if (payload.status) {
            return this.updateStatus(instituteId, leadId, payload.status);
        }

        const existing = await findLeadByIdInInstitute(instituteId, leadId);
        if (!existing) {
            throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
        }

        if (payload.message !== undefined && payload.message !== null) {
            z.string().trim().max(1024).parse(payload.message);
        }

        const followUpAt =
            payload.followUpAt === undefined
                ? undefined
                : payload.followUpAt
                    ? new Date(payload.followUpAt)
                    : null;

        await updateLeadByIdInInstitute(instituteId, leadId, {
            message: payload.message,
            followUpAt,
        });

        const updated = await findLeadByIdInInstitute(instituteId, leadId);
        if (!updated) {
            throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
        }

        if (
            payload.message !== undefined &&
            payload.message !== null &&
            payload.message.trim().length > 0 &&
            payload.message !== (existing.message ?? "")
        ) {
            await logLeadActivity({
                leadId: updated.id,
                instituteId,
                activityType: "NOTE_ADDED",
                title: "Note added",
            });

            await eventDispatcherService.dispatch({
                event: "LEAD_NOTE_ADDED",
                instituteId,
                message: `A new note was added for ${updated.name}.`,
                link: `/leads/${updated.id}`,
                metadata: { leadId: updated.id },
            });
        }

        if (existing.followUpAt?.toISOString() !== updated.followUpAt?.toISOString()) {
            if (updated.followUpAt) {
                await logLeadActivity({
                    leadId: updated.id,
                    instituteId,
                    activityType: "FOLLOWUP_SCHEDULED",
                    title: "Follow-up scheduled",
                    description: `Next follow-up on ${updated.followUpAt.toISOString().slice(0, 10)}`,
                });

                await eventDispatcherService.dispatch({
                    event: "FOLLOW_UP_SCHEDULED",
                    instituteId,
                    message: `Follow-up scheduled for ${updated.name} on ${updated.followUpAt.toISOString().slice(0, 10)}.`,
                    link: `/leads/${updated.id}`,
                    metadata: { leadId: updated.id, followUpAt: updated.followUpAt.toISOString() },
                });
            } else if (existing.followUpAt && !updated.followUpAt) {
                await logLeadActivity({
                    leadId: updated.id,
                    instituteId,
                    activityType: "FOLLOWUP_COMPLETED",
                    title: "Follow-up completed",
                });

                await eventDispatcherService.dispatch({
                    event: "FOLLOW_UP_COMPLETED",
                    instituteId,
                    message: `Follow-up completed for ${updated.name}.`,
                    link: `/leads/${updated.id}`,
                    metadata: { leadId: updated.id },
                });
            }
        }

        return updated;
    },

    async getLeadTimeline(instituteId: string, leadId: string) {
        const lead = await findLeadByIdInInstitute(instituteId, leadId);
        if (!lead) {
            throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
        }

        return listLeadActivities(instituteId, leadId);
    },

    async searchLeads(
        instituteId: string,
        query?: string,
        status?: string,
        from?: Date,
        to?: Date
    ) {
        return listLeadRecords({
            instituteId,
            query,
            status,
            from,
            to,
        });
    },

    async getLeads(
        instituteId: string,
        filters: { status?: string; query?: string; from?: string; to?: string }
    ) {
        const parsed = listInputSchema.parse(filters);
        return this.searchLeads(instituteId, parsed.query, parsed.status, parsed.from, parsed.to);
    },

    async filterLeads(instituteId: string, status: string) {
        return listLeadRecords({ instituteId, status });
    },

    async exportLeads(instituteId: string) {
        const leads = await listLeadRecords({ instituteId });
        return leads.map((lead) => ({
            id: lead.id,
            name: lead.name,
            phone: lead.phone,
            email: lead.email ?? "",
            status: lead.status,
            source: lead.source ?? "",
            createdAt: lead.createdAt.toISOString(),
        }));
    },

    async importLeads(
        instituteId: string,
        rows: unknown[],
        options?: { createdBy?: string; dryRun?: boolean }
    ) {
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new AppError("Import file does not contain any rows", 400, "EMPTY_IMPORT_FILE");
        }

        const errors: Array<{ row: number; message: string }> = [];
        const skippedDuplicates: Array<{ row: number; phone: string }> = [];
        const validRows: Array<z.infer<typeof leadImportRowSchema>> = [];
        const seenPhones = new Set<string>();

        for (let index = 0; index < rows.length; index += 1) {
            const rowNumber = index + 1;
            const raw = rows[index] as Record<string, unknown>;

            const normalized = {
                name: typeof raw.name === "string" ? raw.name.trim() : "",
                phone: typeof raw.phone === "string" ? raw.phone.trim() : String(raw.phone ?? "").trim(),
                email: typeof raw.email === "string" && raw.email.trim().length > 0 ? raw.email.trim() : undefined,
                source: typeof raw.source === "string" && raw.source.trim().length > 0 ? raw.source.trim() : undefined,
                course: typeof raw.course === "string" && raw.course.trim().length > 0 ? raw.course.trim() : undefined,
                city: typeof raw.city === "string" && raw.city.trim().length > 0 ? raw.city.trim() : undefined,
                message: typeof raw.message === "string" && raw.message.trim().length > 0 ? raw.message.trim() : undefined,
            };

            const parsed = leadImportRowSchema.safeParse(normalized);
            if (!parsed.success) {
                errors.push({ row: rowNumber, message: parsed.error.issues[0]?.message ?? "Invalid row" });
                continue;
            }

            if (seenPhones.has(parsed.data.phone)) {
                skippedDuplicates.push({ row: rowNumber, phone: parsed.data.phone });
                continue;
            }

            const existing = await findLeadByPhoneInInstitute(instituteId, parsed.data.phone);
            if (existing) {
                skippedDuplicates.push({ row: rowNumber, phone: parsed.data.phone });
                continue;
            }

            seenPhones.add(parsed.data.phone);
            validRows.push(parsed.data);
        }

        if (!options?.dryRun && validRows.length > 0) {
            await bulkCreateLeadRecords(
                validRows.map((row) => ({
                    instituteId,
                    name: row.name,
                    phone: row.phone,
                    email: row.email,
                    source: row.source,
                    course: row.course,
                    message: row.message,
                    status: "NEW",
                }))
            );
        }

        return {
            totalRows: rows.length,
            validRows: validRows.length,
            failedRows: errors.length,
            duplicateRows: skippedDuplicates.length,
            errors,
            duplicates: skippedDuplicates,
            preview: validRows.slice(0, 100),
            imported: options?.dryRun ? 0 : validRows.length,
        };
    },
};




