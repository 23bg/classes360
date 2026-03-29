import { z } from "zod";
import { batchRepository } from "@/features/batch/batchDataApi";
import { AppError } from "@/lib/utils/error";
import { eventDispatcherService } from "@/lib/notifications/event-dispatcher.service";

const batchInputSchema = z.object({
    instituteId: z.string().min(1),
    courseId: z.string().min(1),
    name: z.string().trim().min(2, "Batch name must be at least 2 characters").max(120, "Batch name cannot exceed 120 characters"),
    startDate: z.string().optional(),
    schedule: z.string().trim().max(120).optional(),
    teacherId: z.string().optional(),
});

export const batchService = {
    async createBatch(payload: unknown) {
        const input = batchInputSchema.parse(payload);
        const batch = await batchRepository.create({
            ...input,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
        });

        await eventDispatcherService.dispatch({
            event: "BATCH_CREATED",
            instituteId: input.instituteId,
            message: `Batch created: ${batch.name}.`,
            link: `/batches/${batch.id}`,
            metadata: { batchId: batch.id, courseId: batch.courseId },
        });

        return batch;
    },

    async updateBatch(
        instituteId: string,
        batchId: string,
        payload: { name?: string; startDate?: string | null; schedule?: string | null; teacherId?: string | null }
    ) {
        if (payload.name !== undefined) {
            z.string().trim().min(2).max(120).parse(payload.name);
        }
        if (payload.schedule !== undefined && payload.schedule !== null) {
            z.string().trim().max(120).parse(payload.schedule);
        }
        const updated = await batchRepository.update(instituteId, batchId, {
            name: payload.name,
            startDate: payload.startDate ? new Date(payload.startDate) : payload.startDate === null ? null : undefined,
            schedule: payload.schedule,
            teacherId: payload.teacherId,
        });

        await eventDispatcherService.dispatch({
            event: "BATCH_UPDATED",
            instituteId,
            message: "Batch details updated.",
            link: `/batches/${batchId}`,
            metadata: { batchId },
        });

        return updated;
    },

    async deleteBatch(instituteId: string, batchId: string) {
        await batchRepository.remove(instituteId, batchId);
        return { success: true };
    },

    async getBatches(instituteId: string) {
        return batchRepository.listByInstitute(instituteId);
    },

    async getBatchesByCourse(instituteId: string, courseId: string) {
        return batchRepository.listByCourse(instituteId, courseId);
    },

    async getBatchById(instituteId: string, batchId: string) {
        const batch = await batchRepository.findById(instituteId, batchId);
        if (!batch) {
            throw new AppError("Batch not found", 404, "BATCH_NOT_FOUND");
        }
        return batch;
    },
};

