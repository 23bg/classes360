import type { Prisma } from "@prisma/client";

export const withTenantScope = <T extends Prisma.Enumerable<Prisma.JsonObject> | Record<string, unknown>>(
    instituteId: string,
    where?: T
): T & { instituteId: string } => {
    return {
        instituteId,
        ...(where || {}),
    } as T & { instituteId: string };
};
