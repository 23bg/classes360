import { PrismaClient } from "@prisma/client";
import { assertServerEnv } from "@/lib/config/env";

assertServerEnv();

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

export const db =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

export const prisma = db;

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}

