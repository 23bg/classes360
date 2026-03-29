import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";

const { mockPrisma, mockStudentService, mockInstituteRepo, mockBillingService, mockEventDispatcherService } = vi.hoisted(() => ({
    mockPrisma: {
        lead: {
            create: vi.fn(),
            findFirst: vi.fn(),
            updateMany: vi.fn(),
            findMany: vi.fn(),
            createMany: vi.fn(),
        },
    },
    mockStudentService: {
        findStudentByPhoneInInstitute: vi.fn(),
        createStudentRecord: vi.fn(),
    },
    mockInstituteRepo: {
        findBySlug: vi.fn(),
    },
    mockBillingService: {
        assertCanCreateLeads: vi.fn(),
    },
    mockEventDispatcherService: {
        dispatch: vi.fn(),
    },
}));

vi.mock("@/lib/db/prisma", () => ({
    prisma: mockPrisma,
}));

vi.mock("@/server/services/students.service", () => ({
    studentService: mockStudentService,
}));

vi.mock("@/features/institute/repositories/institute.repo", () => ({
    instituteRepository: mockInstituteRepo,
}));

vi.mock("@/features/billing/services/billing.service", () => ({
    billingService: mockBillingService,
}));

vi.mock("@/lib/notifications/event-dispatcher.service", () => ({
    eventDispatcherService: mockEventDispatcherService,
}));

vi.mock("@/lib/utils/logger", () => ({
    logger: {
        warn: vi.fn(),
    },
}));

import { leadActivityService, leadService } from "@/server/services/leads.service";

describe("leadService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockBillingService.assertCanCreateLeads.mockResolvedValue(undefined);
        mockPrisma.lead.updateMany.mockResolvedValue({ count: 1 });
    });

    it("creates lead with NEW status", async () => {
        mockPrisma.lead.findFirst.mockResolvedValue(null);
        mockPrisma.lead.create.mockResolvedValue({ id: "l1", instituteId: "inst1", name: "Rahul", phone: "9876543210" });

        await leadService.createLead({
            instituteId: "inst1",
            name: "Rahul",
            phone: "9876543210",
            email: "r@test.com",
        });

        expect(mockPrisma.lead.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "NEW" }) }));
        expect(mockEventDispatcherService.dispatch).toHaveBeenCalled();
    });

    it("throws duplicate lead error for same phone in institute", async () => {
        mockPrisma.lead.findFirst.mockResolvedValue({ id: "existing-lead", phone: "9876543210" });

        await expect(
            leadService.createLead({
                instituteId: "inst1",
                name: "Rahul",
                phone: "9876543210",
            })
        ).rejects.toMatchObject({
            statusCode: 409,
            code: "DUPLICATE_LEAD",
        });
    });

    it("throws for missing institute in create by slug", async () => {
        mockInstituteRepo.findBySlug.mockResolvedValue(null);

        await expect(
            leadService.createLeadBySlug("bad-slug", { name: "Valid Name", phone: "9876543210" })
        ).rejects.toThrow(AppError);
    });

    it("updates lead status and creates student on ADMITTED", async () => {
        mockPrisma.lead.findFirst
            .mockResolvedValueOnce({ id: "l1", instituteId: "inst1", name: "Lead", phone: "9876543210", email: "lead@test.com", status: "NEW" })
            .mockResolvedValueOnce({ id: "l1", instituteId: "inst1", name: "Lead", phone: "9876543210", email: "lead@test.com", status: "ADMITTED" });
        mockStudentService.findStudentByPhoneInInstitute.mockResolvedValue(null);
        mockStudentService.createStudentRecord.mockResolvedValue({ id: "s1" });

        const result = await leadService.updateStatus("inst1", "l1", "ADMITTED");

        expect(mockPrisma.lead.updateMany).toHaveBeenCalled();
        expect(mockStudentService.createStudentRecord).toHaveBeenCalled();
        expect(result.id).toBe("l1");
    });

    it("throws duplicate student error on admitted status", async () => {
        mockPrisma.lead.findFirst
            .mockResolvedValueOnce({ id: "l1", instituteId: "inst1", name: "Lead", phone: "9876543210", email: "lead@test.com", status: "NEW" })
            .mockResolvedValueOnce({ id: "l1", instituteId: "inst1", name: "Lead", phone: "9876543210", email: "lead@test.com", status: "ADMITTED" });
        mockStudentService.findStudentByPhoneInInstitute.mockResolvedValue({ id: "s1" });

        await expect(leadService.updateStatus("inst1", "l1", "ADMITTED")).rejects.toThrow(AppError);
    });

    it("throws when nothing to update", async () => {
        await expect(leadService.updateLead("inst1", "l1", {})).rejects.toThrow(AppError);
    });

    it("updates notes and follow-up fields", async () => {
        mockPrisma.lead.findFirst
            .mockResolvedValueOnce({ id: "l1", instituteId: "inst1", name: "Lead", message: null, followUpAt: null })
            .mockResolvedValueOnce({ id: "l1", instituteId: "inst1", name: "Lead", message: "called", followUpAt: new Date("2026-02-27T00:00:00.000Z") });

        await leadService.updateLead("inst1", "l1", { message: "called", followUpAt: "2026-02-27" });

        expect(mockPrisma.lead.updateMany).toHaveBeenCalled();
    });

    it("delegates getLeads filters parsing", async () => {
        mockPrisma.lead.findMany.mockResolvedValue([{ id: "l1" }]);

        const result = await leadService.getLeads("inst1", { query: "rahul" });

        expect(mockPrisma.lead.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ instituteId: "inst1" }) }));
        expect(result).toHaveLength(1);
    });

    it("exports leads with expected shape", async () => {
        mockPrisma.lead.findMany.mockResolvedValue([
            {
                id: "l1",
                name: "A",
                phone: "9876543210",
                email: null,
                status: "NEW",
                source: null,
                createdAt: new Date("2026-02-27T00:00:00.000Z"),
            },
        ]);

        const result = await leadService.exportLeads("inst1");
        expect(result[0]).toMatchObject({
            id: "l1",
            email: "",
            source: "",
            status: "NEW",
        });
    });

    it("returns lead timeline entries for existing lead", async () => {
        mockPrisma.lead.findFirst
            .mockResolvedValueOnce({ id: "l1", instituteId: "inst1" })
            .mockResolvedValueOnce({
                id: "l1",
                instituteId: "inst1",
                activities: [
                    {
                        activityType: "LEAD_CREATED",
                        title: "Lead created",
                        createdAt: new Date("2026-03-01T00:00:00.000Z"),
                    },
                ],
            });

        const result = await leadService.getLeadTimeline("inst1", "l1");

        expect(result).toHaveLength(1);
    });

    it("throws when timeline requested for missing lead", async () => {
        mockPrisma.lead.findFirst.mockResolvedValue(null);

        await expect(leadService.getLeadTimeline("inst1", "missing")).rejects.toMatchObject({
            statusCode: 404,
            code: "LEAD_NOT_FOUND",
        });
    });

    it("exposes lead activity helpers", async () => {
        mockPrisma.lead.findFirst.mockResolvedValue({ id: "l1", instituteId: "inst1", activities: [] });

        const result = await leadActivityService.listByLead("inst1", "l1");

        expect(result).toEqual([]);
    });
});
