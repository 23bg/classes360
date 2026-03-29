import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/utils/error";

const markAttendanceSchema = z.object({
    instituteId: z.string().min(1),
    studentId: z.string().min(1),
    date: z.string().min(1),
    status: z.enum(["PRESENT", "ABSENT"]),
    courseId: z.string().optional(),
    batchId: z.string().optional(),
    markedBy: z.string().optional(),
});

const bulkMarkSchema = z.object({
    instituteId: z.string().min(1),
    date: z.string().min(1),
    status: z.enum(["PRESENT", "ABSENT"]),
    courseId: z.string().optional(),
    batchId: z.string().optional(),
    studentIds: z.array(z.string().min(1)).min(1),
    markedBy: z.string().optional(),
});

export const attendanceService = {
    async listAttendance(
        instituteId: string,
        filters?: { studentId?: string; courseId?: string; batchId?: string; from?: string; to?: string }
    ) {
        const fromDate = filters?.from ? new Date(filters.from) : undefined;
        const toDate = filters?.to ? new Date(filters.to) : undefined;

        const items = await prisma.attendance.findMany({
            where: {
                instituteId,
                deletedAt: null,
                ...(filters?.studentId ? { studentId: filters.studentId } : {}),
                ...(filters?.courseId ? { courseId: filters.courseId } : {}),
                ...(filters?.batchId ? { batchId: filters.batchId } : {}),
                ...(fromDate || toDate
                    ? {
                        date: {
                            ...(fromDate ? { gte: fromDate } : {}),
                            ...(toDate ? { lte: toDate } : {}),
                        },
                    }
                    : {}),
            },
            orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        });

        return items;
    },

    async markAttendance(payload: unknown) {
        const input = markAttendanceSchema.parse(payload);
        const date = new Date(input.date);

        if (!input.courseId && !input.batchId) {
            throw new AppError("Either courseId or batchId is required", 400, "ATTENDANCE_SCOPE_REQUIRED");
        }

        const existing = await prisma.attendance.findFirst({
            where: {
                instituteId: input.instituteId,
                studentId: input.studentId,
                date,
                courseId: input.courseId ?? null,
                batchId: input.batchId ?? null,
                deletedAt: null,
            },
        });

        if (existing) {
            return prisma.attendance.update({
                where: { id: existing.id },
                data: {
                    status: input.status,
                    markedBy: input.markedBy,
                },
            });
        }

        return prisma.attendance.create({
            data: {
                instituteId: input.instituteId,
                studentId: input.studentId,
                courseId: input.courseId,
                batchId: input.batchId,
                date,
                status: input.status,
                markedBy: input.markedBy,
            },
        });
    },

    async bulkMarkAttendance(payload: unknown) {
        const input = bulkMarkSchema.parse(payload);

        const results = await Promise.all(
            input.studentIds.map((studentId) =>
                this.markAttendance({
                    instituteId: input.instituteId,
                    studentId,
                    date: input.date,
                    status: input.status,
                    courseId: input.courseId,
                    batchId: input.batchId,
                    markedBy: input.markedBy,
                })
            )
        );

        return {
            updated: results.length,
        };
    },

    async getStudentAttendanceSummary(
        instituteId: string,
        studentId: string,
        filters?: { courseId?: string; batchId?: string }
    ) {
        const rows = await prisma.attendance.findMany({
            where: {
                instituteId,
                studentId,
                deletedAt: null,
                ...(filters?.courseId ? { courseId: filters.courseId } : {}),
                ...(filters?.batchId ? { batchId: filters.batchId } : {}),
            },
            orderBy: { date: "desc" },
        });

        const present = rows.filter((row) => row.status === "PRESENT").length;
        const absent = rows.filter((row) => row.status === "ABSENT").length;
        const total = rows.length;

        return {
            rows,
            summary: {
                present,
                absent,
                total,
                attendanceRate: total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0,
            },
        };
    },
};
