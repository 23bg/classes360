import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        lead: {
            updateMany: vi.fn(),
            findFirst: vi.fn(),
        },
    },
}));

vi.mock("@/lib/db/prisma", () => ({
    prisma: mockPrisma,
}));

vi.mock("@/lib/utils/logger", () => ({
    logger: {
        warn: vi.fn(),
    },
}));

import { leadActivityService } from "@/server/services/leads.service";

describe("leadActivityService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPrisma.lead.updateMany.mockResolvedValue({ count: 0 });
        mockPrisma.lead.findFirst.mockResolvedValue(null);
    });

    it("does not throw when lead is missing for activity push", async () => {
        await expect(
            leadActivityService.log({
                leadId: "l1",
                instituteId: "inst1",
                activityType: "LEAD_CREATED",
                title: "Lead created",
            })
        ).resolves.toBeUndefined();
    });

    it("returns empty timeline when lead is not found", async () => {
        const result = await leadActivityService.listByLead("inst1", "l1");
        expect(result).toEqual([]);
    });

    it("maps timeline rows when embedded activities are available", async () => {
        mockPrisma.lead.findFirst.mockResolvedValue({
            id: "l1",
            instituteId: "inst1",
            activities: [
                {
                    activityType: "STATUS_CHANGED",
                    title: "Status changed",
                    description: "NEW → CONTACTED",
                    actorUserId: "u1",
                    createdAt: new Date("2026-03-01T10:00:00.000Z"),
                },
            ],
        });

        const result = await leadActivityService.listByLead("inst1", "l1");

        expect(mockPrisma.lead.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({ where: { instituteId: "inst1", id: "l1" } })
        );
        expect(result).toEqual([
            {
                leadId: "l1",
                instituteId: "inst1",
                activityType: "STATUS_CHANGED",
                title: "Status changed",
                description: "NEW → CONTACTED",
                actorUserId: "u1",
                createdAt: "2026-03-01T10:00:00.000Z",
            },
        ]);
    });
});
