import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { withTenantScope } from "@/lib/db/tenant-scope";
import { AppError } from "@/lib/utils/error";
import { eventDispatcherService } from "@/lib/notifications/event-dispatcher.service";

const studentInputSchema = z.object({
    instituteId: z.string().min(1),
    name: z.string().trim().min(2).max(80),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().trim().max(120).email().optional(),
    courseId: z.string().optional(),
    batchId: z.string().optional(),
    admissionDate: z.string().optional(),
    fees: z.number().min(0).optional(),
});

const assignSchema = z.object({
    instituteId: z.string().min(1),
    studentId: z.string().min(1),
    courseId: z.string().min(1),
    batchId: z.string().optional(),
    joinedAt: z.string().optional(),
    status: z.enum(["ACTIVE", "COMPLETED", "DROPPED"]).optional(),
    createdBy: z.string().optional(),
});

type CreateStudentRecordInput = {
    instituteId: string;
    name: string;
    phone: string;
    email?: string;
    courseId?: string;
    batchId?: string;
    admissionDate?: Date;
};

type UpdateStudentInput = {
    name?: string;
    phone?: string;
    email?: string | null;
    courseId?: string | null;
    batchId?: string | null;
};

type UploadCsvResult = {
    inserted: number;
    errors: Array<{ row: number; message: string }>;
};

const createStudentRecord = async (payload: CreateStudentRecordInput) =>
    prisma.student.create({
        data: payload,
    });

const findStudentByPhoneInInstitute = async (instituteId: string, phone: string) =>
    prisma.student.findFirst({
        where: withTenantScope(instituteId, { phone }),
    });

const listStudentsByInstitute = async (instituteId: string) =>
    prisma.student.findMany({
        where: withTenantScope(instituteId),
        orderBy: { createdAt: "desc" },
    });

const bulkCreateStudents = async (rows: CreateStudentRecordInput[]) =>
    prisma.student.createMany({
        data: rows,
    });

const updateStudentRecord = async (instituteId: string, studentId: string, payload: UpdateStudentInput) =>
    prisma.student.updateMany({
        where: { id: studentId, instituteId },
        data: {
            ...(payload.name !== undefined ? { name: payload.name } : {}),
            ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
            ...(payload.email !== undefined ? { email: payload.email } : {}),
            ...(payload.courseId !== undefined ? { courseId: payload.courseId } : {}),
            ...(payload.batchId !== undefined ? { batchId: payload.batchId } : {}),
        },
    });

const deleteStudentRecord = async (instituteId: string, studentId: string) =>
    prisma.student.deleteMany({
        where: { id: studentId, instituteId },
    });

const createStudentCourseAssignment = async (payload: {
    instituteId: string;
    studentId: string;
    courseId: string;
    batchId?: string;
    joinedAt?: Date;
    status?: "ACTIVE" | "COMPLETED" | "DROPPED";
    createdBy?: string;
}) =>
    prisma.studentCourse.create({
        data: {
            instituteId: payload.instituteId,
            studentId: payload.studentId,
            courseId: payload.courseId,
            batchId: payload.batchId,
            joinedAt: payload.joinedAt,
            status: payload.status,
            createdBy: payload.createdBy,
        },
    });

const listStudentCourseAssignments = async (instituteId: string, studentId: string) =>
    prisma.studentCourse.findMany({
        where: withTenantScope(instituteId, { studentId }),
        orderBy: { joinedAt: "desc" },
    });

const findActiveStudentCourseAssignment = async (
    instituteId: string,
    studentId: string,
    courseId: string,
    batchId?: string
) =>
    prisma.studentCourse.findFirst({
        where: withTenantScope(instituteId, {
            studentId,
            courseId,
            batchId: batchId ?? null,
            status: "ACTIVE" as const,
        }),
    });

const updateStudentCourseAssignmentStatus = async (
    instituteId: string,
    assignmentId: string,
    status: "ACTIVE" | "COMPLETED" | "DROPPED"
) =>
    prisma.studentCourse.updateMany({
        where: { id: assignmentId, instituteId },
        data: { status },
    });

export const studentService = {
    createStudentRecord,
    findStudentByPhoneInInstitute,

    async createStudent(payload: unknown) {
        const input = studentInputSchema.parse(payload);

        const duplicate = await findStudentByPhoneInInstitute(input.instituteId, input.phone);
        if (duplicate) {
            throw new AppError("Student already exists with this phone", 409, "DUPLICATE_STUDENT");
        }

        const student = await createStudentRecord({
            instituteId: input.instituteId,
            name: input.name,
            phone: input.phone,
            email: input.email,
            courseId: input.courseId,
            batchId: input.batchId,
            admissionDate: input.admissionDate ? new Date(input.admissionDate) : undefined,
        });

        let feeAmount = input.fees;
        if (feeAmount === undefined && input.courseId) {
            const course = await prisma.course.findFirst({
                where: { id: input.courseId, instituteId: input.instituteId },
                select: { defaultFees: true },
            });
            if (course?.defaultFees) {
                feeAmount = course.defaultFees;
            }
        }

        if (feeAmount && feeAmount > 0) {
            await prisma.feePlan.create({
                data: {
                    studentId: student.id,
                    instituteId: input.instituteId,
                    totalAmount: feeAmount,
                },
            });
        }

        await eventDispatcherService.dispatch({
            event: "STUDENT_CREATED",
            instituteId: input.instituteId,
            studentId: student.id,
            message: `Student created: ${student.name} (${student.phone}).`,
            link: `/students/${student.id}`,
            whatsappPhoneNumber: student.phone,
            metadata: { studentId: student.id },
            templateEvent: "admission_confirmed",
            templateVariables: {
                student_name: student.name,
                course_name: "Course",
            },
        });

        return student;
    },

    async updateStudent(instituteId: string, studentId: string, payload: UpdateStudentInput) {
        if (payload.name) {
            z.string().trim().min(2).max(80).parse(payload.name);
        }
        if (payload.phone) {
            z.string().regex(/^[6-9]\d{9}$/).parse(payload.phone);
        }
        if (payload.email) {
            z.string().trim().max(120).email().parse(payload.email);
        }

        const before = await prisma.student.findFirst({
            where: { id: studentId, instituteId },
            select: { id: true, name: true, batchId: true, courseId: true },
        });

        if (!before) {
            throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
        }

        await updateStudentRecord(instituteId, studentId, payload);

        const updated = await prisma.student.findFirst({
            where: { id: studentId, instituteId },
            select: { id: true, name: true, batchId: true, courseId: true },
        });

        if (!updated) {
            throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
        }

        await eventDispatcherService.dispatch({
            event: "STUDENT_UPDATED",
            instituteId,
            studentId,
            message: `Student profile updated for ${updated.name}.`,
            link: `/students/${studentId}`,
            metadata: { studentId },
        });

        if (before.batchId !== updated.batchId) {
            await eventDispatcherService.dispatch({
                event: "STUDENT_BATCH_CHANGED",
                instituteId,
                studentId,
                message: `Batch changed for ${updated.name}.`,
                link: `/students/${studentId}`,
                metadata: { studentId, previousBatchId: before.batchId, batchId: updated.batchId },
            });
        }

        if (before.courseId !== updated.courseId) {
            await eventDispatcherService.dispatch({
                event: "STUDENT_COURSE_CHANGED",
                instituteId,
                studentId,
                message: `Course changed for ${updated.name}.`,
                link: `/students/${studentId}`,
                metadata: { studentId, previousCourseId: before.courseId, courseId: updated.courseId },
            });
        }

        return { count: 1 };
    },

    async listStudents(instituteId: string) {
        return listStudentsByInstitute(instituteId);
    },

    async deleteStudent(instituteId: string, studentId: string) {
        await deleteStudentRecord(instituteId, studentId);
        return { success: true };
    },

    async uploadCsv(instituteId: string, csvText: string): Promise<UploadCsvResult> {
        const rows = csvText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (rows.length < 2) {
            throw new AppError("CSV must include header and at least one row", 400, "CSV_INVALID");
        }

        const header = rows[0].split(",").map((col) => col.trim().toLowerCase());
        const nameIndex = header.indexOf("name");
        const phoneIndex = header.indexOf("phone");
        const emailIndex = header.indexOf("email");
        const courseIndex = header.indexOf("course");
        const batchIndex = header.indexOf("batch");
        const feesIndex = header.indexOf("fees");

        if (nameIndex === -1 || phoneIndex === -1) {
            throw new AppError("CSV must contain name and phone columns", 400, "CSV_HEADER_INVALID");
        }

        const [courses, batches] = await Promise.all([
            prisma.course.findMany({
                where: { instituteId },
                select: { id: true, name: true, defaultFees: true },
            }),
            prisma.batch.findMany({
                where: { instituteId },
                select: { id: true, name: true },
            }),
        ]);

        const courseMap = new Map(courses.map((course) => [course.name.toLowerCase(), course.id]));
        const batchMap = new Map(batches.map((batch) => [batch.name.toLowerCase(), batch.id]));
        const courseFeesMap = new Map(
            courses
                .filter((course) => Boolean(course.defaultFees && course.defaultFees > 0))
                .map((course) => [course.id, course.defaultFees ?? 0])
        );

        const errors: Array<{ row: number; message: string }> = [];
        const accepted: Array<CreateStudentRecordInput & { fees?: number }> = [];
        const seenPhones = new Set<string>();

        for (let index = 1; index < rows.length; index += 1) {
            const values = rows[index].split(",").map((value) => value.trim());
            const rowNumber = index + 1;

            const name = values[nameIndex] ?? "";
            const phone = values[phoneIndex] ?? "";
            const email = emailIndex >= 0 ? values[emailIndex] : undefined;
            const courseName = courseIndex >= 0 ? values[courseIndex] : undefined;
            const batchName = batchIndex >= 0 ? values[batchIndex] : undefined;
            const feesStr = feesIndex >= 0 ? values[feesIndex] : undefined;

            if (!name || name.length < 2 || name.length > 80) {
                errors.push({ row: rowNumber, message: "Invalid name" });
                continue;
            }

            if (!/^[6-9]\d{9}$/.test(phone)) {
                errors.push({ row: rowNumber, message: "Invalid phone" });
                continue;
            }

            if (email && !z.string().trim().max(120).email().safeParse(email).success) {
                errors.push({ row: rowNumber, message: "Invalid email" });
                continue;
            }

            if (seenPhones.has(phone)) {
                errors.push({ row: rowNumber, message: "Duplicate phone in CSV" });
                continue;
            }

            const duplicate = await findStudentByPhoneInInstitute(instituteId, phone);
            if (duplicate) {
                errors.push({ row: rowNumber, message: "Duplicate phone already exists" });
                continue;
            }

            const courseId = courseName ? courseMap.get(courseName.toLowerCase()) : undefined;
            const batchId = batchName ? batchMap.get(batchName.toLowerCase()) : undefined;

            let fees: number | undefined;
            if (feesStr && feesStr.length > 0) {
                const parsed = parseFloat(feesStr);
                if (!Number.isNaN(parsed) && parsed > 0) {
                    fees = parsed;
                }
            } else if (courseId) {
                fees = courseFeesMap.get(courseId);
            }

            seenPhones.add(phone);
            accepted.push({
                instituteId,
                name,
                phone,
                email: email || undefined,
                courseId,
                batchId,
                fees,
            });
        }

        if (accepted.length > 0) {
            await bulkCreateStudents(accepted.map(({ fees: _fees, ...student }) => student));

            for (const entry of accepted.filter((student) => student.fees && student.fees > 0)) {
                const student = await findStudentByPhoneInInstitute(instituteId, entry.phone);
                if (student && entry.fees) {
                    await prisma.feePlan.create({
                        data: {
                            studentId: student.id,
                            instituteId,
                            totalAmount: entry.fees,
                        },
                    });
                }
            }
        }

        return {
            inserted: accepted.length,
            errors,
        };
    },

    async listStudentCourses(instituteId: string, studentId: string) {
        const [assignments, courses, batches] = await Promise.all([
            listStudentCourseAssignments(instituteId, studentId),
            prisma.course.findMany({ where: { instituteId }, select: { id: true, name: true } }),
            prisma.batch.findMany({ where: { instituteId }, select: { id: true, name: true, startDate: true } }),
        ]);

        const courseMap = new Map(courses.map((course) => [course.id, course.name]));
        const batchMap = new Map(batches.map((batch) => [batch.id, batch]));

        return assignments.map((assignment) => ({
            ...assignment,
            courseName: courseMap.get(assignment.courseId) ?? "Unknown course",
            batchName: assignment.batchId ? (batchMap.get(assignment.batchId)?.name ?? "Unknown batch") : null,
            batchStartDate: assignment.batchId ? (batchMap.get(assignment.batchId)?.startDate ?? null) : null,
        }));
    },

    async assignCourse(payload: unknown) {
        const input = assignSchema.parse(payload);

        const student = await prisma.student.findFirst({ where: { id: input.studentId, instituteId: input.instituteId } });
        if (!student) {
            throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
        }

        const course = await prisma.course.findFirst({ where: { id: input.courseId, instituteId: input.instituteId } });
        if (!course) {
            throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
        }

        if (input.batchId) {
            const batch = await prisma.batch.findFirst({ where: { id: input.batchId, instituteId: input.instituteId } });
            if (!batch) {
                throw new AppError("Batch not found", 404, "BATCH_NOT_FOUND");
            }

            if (batch.courseId !== input.courseId) {
                throw new AppError("Batch does not belong to selected course", 400, "BATCH_COURSE_MISMATCH");
            }
        }

        const duplicate = await findActiveStudentCourseAssignment(
            input.instituteId,
            input.studentId,
            input.courseId,
            input.batchId
        );

        if (duplicate) {
            throw new AppError("Student is already assigned to this course and batch", 409, "DUPLICATE_STUDENT_COURSE");
        }

        const assignment = await createStudentCourseAssignment({
            instituteId: input.instituteId,
            studentId: input.studentId,
            courseId: input.courseId,
            batchId: input.batchId,
            joinedAt: input.joinedAt ? new Date(input.joinedAt) : undefined,
            status: input.status ?? "ACTIVE",
            createdBy: input.createdBy,
        });

        await prisma.student.updateMany({
            where: { id: input.studentId, instituteId: input.instituteId },
            data: { courseId: input.courseId, batchId: input.batchId ?? null },
        });

        return assignment;
    },

    async updateAssignmentStatus(
        instituteId: string,
        assignmentId: string,
        status: "ACTIVE" | "COMPLETED" | "DROPPED"
    ) {
        await updateStudentCourseAssignmentStatus(instituteId, assignmentId, status);
        return { success: true };
    },

    async setPortalCredentials(
        instituteId: string,
        studentId: string,
        payload: { username?: string; email?: string; password: string }
    ) {
        const student = await prisma.student.findFirst({
            where: { id: studentId, instituteId },
            select: { id: true, email: true, name: true, phone: true },
        });

        if (!student) {
            throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
        }

        const normalizedUsername = payload.username?.trim().toLowerCase();
        const normalizedEmail = payload.email?.trim().toLowerCase() ?? student.email?.toLowerCase();

        if (!normalizedUsername && !normalizedEmail) {
            throw new AppError("Username or email is required", 400, "INVALID_PORTAL_CREDENTIALS");
        }

        if (!payload.password || payload.password.trim().length < 6) {
            throw new AppError("Password must be at least 6 characters", 400, "INVALID_PASSWORD");
        }

        const passwordHash = await bcrypt.hash(payload.password, 10);
        await prisma.student.updateMany({
            where: { id: student.id, instituteId },
            data: {
                portalUsername: normalizedUsername,
                portalEmail: normalizedEmail,
                portalPasswordHash: passwordHash,
                portalActive: true,
            },
        });

        await eventDispatcherService.dispatch({
            event: "STUDENT_PORTAL_CREDENTIALS_CREATED",
            instituteId,
            studentId: student.id,
            message: `Portal credentials set for student ${student.name}. Student can now log in to the portal.`,
            whatsappPhoneNumber: student.phone,
            emailTo: student.email ? [student.email] : undefined,
            link: "/student",
            metadata: { studentId: student.id },
        });

        return { success: true };
    },

    async loginToPortal(identifier: string, password: string) {
        const normalizedIdentifier = identifier.trim().toLowerCase();
        if (!normalizedIdentifier || !password) {
            throw new AppError("Username/email and password are required", 400, "INVALID_CREDENTIALS");
        }

        const account = await prisma.student.findFirst({
            where: {
                portalActive: true,
                OR: [{ portalUsername: normalizedIdentifier }, { portalEmail: normalizedIdentifier }],
            },
            select: {
                instituteId: true,
                id: true,
                portalPasswordHash: true,
            },
        });

        if (!account || !account.portalPasswordHash) {
            throw new AppError("Invalid login credentials", 401, "INVALID_CREDENTIALS");
        }

        const valid = await bcrypt.compare(password, account.portalPasswordHash);
        if (!valid) {
            throw new AppError("Invalid login credentials", 401, "INVALID_CREDENTIALS");
        }

        const student = await prisma.student.findFirst({
            where: { id: account.id, instituteId: account.instituteId },
            select: { id: true, name: true, instituteId: true },
        });

        if (!student) {
            throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
        }

        await eventDispatcherService.dispatch({
            event: "PORTAL_LOGIN",
            instituteId: student.instituteId,
            studentId: student.id,
            message: "Login successful.",
            link: "/student",
            metadata: { studentId: student.id },
        });

        return {
            studentId: student.id,
            instituteId: student.instituteId,
            name: student.name,
        };
    },

    async getPortalData(studentId: string, instituteId: string) {
        const student = await prisma.student.findFirst({
            where: { id: studentId, instituteId },
        });

        if (!student) {
            throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
        }

        const [course, batch, institute, notifications] = await Promise.all([
            student.courseId
                ? prisma.course.findFirst({
                    where: { id: student.courseId, instituteId },
                    select: { id: true, name: true, duration: true, description: true },
                })
                : Promise.resolve(null),
            student.batchId
                ? prisma.batch.findFirst({
                    where: { id: student.batchId, instituteId },
                    select: { id: true, name: true, startDate: true },
                })
                : Promise.resolve(null),
            prisma.institute.findFirst({
                where: { id: instituteId },
                select: { id: true, name: true },
            }),
            prisma.studentNotification.findMany({
                where: { studentId },
                orderBy: { createdAt: "desc" },
                take: 30,
            }),
        ]);

        const announcements = (await prisma.studentAnnouncement.findMany({
            where: {
                instituteId,
                OR: [{ batchId: null }, { batchId: student.batchId }],
            },
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
                title: true,
                body: true,
                createdAt: true,
            },
        })).map((item) => ({
            title: item.title,
            body: item.body,
            createdAt: item.createdAt.toISOString(),
        }));

        return {
            student: {
                ...student,
                course,
                batch,
                institute,
            },
            announcements,
            notifications,
        };
    },

    async createAnnouncement(
        instituteId: string,
        payload: { title: string; body: string; batchId?: string | null }
    ) {
        if (!payload.title.trim() || !payload.body.trim()) {
            throw new AppError("Title and body are required", 400, "INVALID_ANNOUNCEMENT");
        }

        await prisma.studentAnnouncement.create({
            data: {
                instituteId,
                batchId: payload.batchId ?? null,
                title: payload.title.trim(),
                body: payload.body.trim(),
            },
        });

        await eventDispatcherService.dispatch({
            event: "ANNOUNCEMENT_CREATED",
            instituteId,
            batchId: payload.batchId ?? null,
            title: payload.title.trim(),
            message: payload.body.trim(),
            link: "/student/announcements",
            metadata: { batchId: payload.batchId ?? null },
        });

        await eventDispatcherService.dispatch({
            event: "NEW_ANNOUNCEMENT_AVAILABLE",
            instituteId,
            batchId: payload.batchId ?? null,
            title: payload.title.trim(),
            message: payload.body.trim(),
            link: "/student/announcements",
            metadata: { batchId: payload.batchId ?? null },
        });

        return { success: true };
    },
};
