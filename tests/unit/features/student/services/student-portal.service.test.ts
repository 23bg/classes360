import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockEventDispatcherService } = vi.hoisted(() => ({
    mockPrisma: {
        student: {
            findFirst: vi.fn(),
            updateMany: vi.fn(),
        },
        studentAnnouncement: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
    mockEventDispatcherService: {
        dispatch: vi.fn(),
    },
}));

vi.mock("@/lib/db/prisma", () => ({
    prisma: mockPrisma,
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn(async () => "hashed-pass"),
        compare: vi.fn(async () => true),
    },
}));

vi.mock("@/lib/notifications/event-dispatcher.service", () => ({
    eventDispatcherService: mockEventDispatcherService,
}));

import { studentService } from "@/server/services/students.service";

describe("studentService portal field updates", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPrisma.student.updateMany.mockResolvedValue({ count: 1 });
        mockEventDispatcherService.dispatch.mockResolvedValue(undefined);
    });

    it("stores credentials on student portal fields", async () => {
        mockPrisma.student.findFirst.mockResolvedValue({ id: "s1", email: "s1@example.com", name: "Student A", phone: "9876543210" });

        const result = await studentService.setPortalCredentials("inst1", "s1", {
            username: "student1",
            email: "s1@example.com",
            password: "secret123",
        });

        expect(mockPrisma.student.updateMany).toHaveBeenCalled();
        expect(result).toEqual({ success: true });
    });

    it("logs in with portalUsername and portalPasswordHash", async () => {
        mockPrisma.student.findFirst
            .mockResolvedValueOnce({
                id: "s1",
                instituteId: "inst1",
                portalPasswordHash: "hashed-pass",
            })
            .mockResolvedValueOnce({
                id: "s1",
                name: "Student A",
                instituteId: "inst1",
            });

        const result = await studentService.loginToPortal("student1", "secret123");

        expect(mockPrisma.student.findFirst).toHaveBeenCalled();
        expect(result).toEqual({ studentId: "s1", instituteId: "inst1", name: "Student A" });
    });
});
