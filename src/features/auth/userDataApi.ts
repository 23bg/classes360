import { prisma } from "@/lib/db/prisma";

type AppRole = "OWNER" | "EDITOR" | "VIEWER" | "MANAGER";

type CreateUserInput = {
    email: string;
    instituteId?: string;
    role?: AppRole;
    name?: string;
    phoneNumber?: string;
    passwordHash?: string;
    emailVerified?: boolean;
    status?: "PENDING_VERIFICATION" | "VERIFIED_NO_PASSWORD" | "ACTIVE" | "BLOCKED";
    otpPending?: boolean;
    otpHash?: string | null;
    otpResendCount?: number;
    otpAttempts?: number;
    otpExpiresAt?: Date | null;
};

const toPrismaRole = (role?: AppRole): "OWNER" | "EDITOR" | "VIEWER" | undefined => {
    if (!role) return undefined;
    if (role === "MANAGER") return "EDITOR";
    return role;
};

export const userRepository = {
    findById: async (id: string) => prisma.user.findUnique({ where: { id } }),

    findByEmail: async (email: string) =>
        prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        }),

    create: async (input: CreateUserInput) =>
        prisma.user.create({
            data: {
                email: input.email.trim().toLowerCase(),
                instituteId: input.instituteId,
                role: toPrismaRole(input.role) ?? "OWNER",
                name: input.name,
                phoneNumber: input.phoneNumber,
                passwordHash: input.passwordHash,
                emailVerified: input.emailVerified ?? false,
                status: input.status ?? "PENDING_VERIFICATION",
                otpPending: input.otpPending ?? false,
                otpHash: input.otpHash,
                otpResendCount: input.otpResendCount,
                otpAttempts: input.otpAttempts,
                otpExpiresAt: input.otpExpiresAt,
            },
        }),

    updateByEmail: async (
        email: string,
        input: {
            instituteId?: string;
            role?: AppRole;
            name?: string | null;
            phoneNumber?: string | null;
            passwordHash?: string;
            emailVerified?: boolean;
            status?: "PENDING_VERIFICATION" | "VERIFIED_NO_PASSWORD" | "ACTIVE" | "BLOCKED";
            otpPending?: boolean;
            otpHash?: string | null;
            otpResendCount?: number;
            otpAttempts?: number;
            otpExpiresAt?: Date | null;
            subject?: string | null;
        }
    ) => {
        const normalizedEmail = email.trim().toLowerCase();
        await prisma.user.updateMany({
            where: { email: normalizedEmail },
            data: {
                ...(input.instituteId !== undefined ? { instituteId: input.instituteId } : {}),
                ...(input.role !== undefined ? { role: toPrismaRole(input.role) } : {}),
                ...(input.name !== undefined ? { name: input.name } : {}),
                ...(input.phoneNumber !== undefined ? { phoneNumber: input.phoneNumber } : {}),
                ...(input.passwordHash !== undefined ? { passwordHash: input.passwordHash } : {}),
                ...(input.emailVerified !== undefined ? { emailVerified: input.emailVerified } : {}),
                ...(input.status !== undefined ? { status: input.status } : {}),
                ...(input.otpPending !== undefined ? { otpPending: input.otpPending } : {}),
                ...(input.otpHash !== undefined ? { otpHash: input.otpHash } : {}),
                ...(input.otpResendCount !== undefined ? { otpResendCount: input.otpResendCount } : {}),
                ...(input.otpAttempts !== undefined ? { otpAttempts: input.otpAttempts } : {}),
                ...(input.otpExpiresAt !== undefined ? { otpExpiresAt: input.otpExpiresAt } : {}),
                ...(input.subject !== undefined ? { subject: input.subject } : {}),
            },
        });

        return prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });
    },

    listByInstitute: async (instituteId: string) =>
        prisma.user.findMany({
            where: { instituteId },
            orderBy: { createdAt: "desc" },
        }),

    countByInstitute: async (instituteId: string) =>
        prisma.user.count({
            where: { instituteId },
        }),

    updateByIdAndInstitute: async (
        id: string,
        instituteId: string,
        input: { role?: AppRole; name?: string | null }
    ) =>
        prisma.user.updateMany({
            where: { id, instituteId },
            data: {
                ...(input.role !== undefined ? { role: toPrismaRole(input.role) } : {}),
                ...(input.name !== undefined ? { name: input.name } : {}),
            },
        }),

    removeByIdAndInstitute: async (id: string, instituteId: string) =>
        prisma.user.deleteMany({
            where: { id, instituteId },
        }),

    updateFirstLogin: async (id: string, firstLogin: boolean) =>
        prisma.user.update({
            where: { id },
            data: { firstLogin },
        }),
};
