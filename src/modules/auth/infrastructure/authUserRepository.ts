import { prisma } from "@/lib/db/prisma";
import { SubscriptionStatus } from "@/modules/auth/domain/types";

export type SessionSnapshot = {
    userId: string;
    email: string;
    role: "OWNER" | "EDITOR" | "VIEWER" | "MANAGER";
    instituteId: string;
    isOnboarded: boolean;
    subscriptionStatus: SubscriptionStatus;
    tokenVersion: number;
};

const toSessionRole = (role: "OWNER" | "EDITOR" | "VIEWER"): SessionSnapshot["role"] => {
    // Keep MANAGER in API/session role vocabulary for backward compatibility.
    if (role === "OWNER" || role === "EDITOR" || role === "VIEWER") {
        return role;
    }

    return "VIEWER";
};

export const authUserRepository = {
    async getSessionSnapshot(userId: string): Promise<SessionSnapshot | null> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                instituteId: true,
                tokenVersion: true,
            },
        });

        if (!user || !user.email) {
            return null;
        }

        let instituteId = user.instituteId;
        if (!instituteId) {
            const baseSlug = (user.email.split("@")[0] || "oncampus")
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .slice(0, 30);

            const createdInstitute = await prisma.institute.create({
                data: {
                    name: null,
                    slug: `temp-${baseSlug || "oncampus"}-${Date.now().toString(36)}`,
                    isOnboarded: false,
                },
                select: { id: true },
            });

            instituteId = createdInstitute.id;

            await prisma.user.update({
                where: { id: user.id },
                data: { instituteId },
            });
        }

        const [institute, subscription] = await Promise.all([
            prisma.institute.findUnique({
                where: { id: instituteId },
                select: { isOnboarded: true },
            }),
            prisma.subscription.findUnique({
                where: { instituteId },
                select: { status: true },
            }),
        ]);

        return {
            userId: user.id,
            email: user.email,
            role: toSessionRole(user.role),
            instituteId,
            isOnboarded: Boolean(institute?.isOnboarded),
            subscriptionStatus: (subscription?.status ?? "TRIAL") as SubscriptionStatus,
            tokenVersion: user.tokenVersion ?? 0,
        };
    },

    async incrementTokenVersion(userId: string): Promise<void> {
        await prisma.user.updateMany({
            where: { id: userId },
            data: {
                tokenVersion: { increment: 1 },
            },
        });
    },
};
