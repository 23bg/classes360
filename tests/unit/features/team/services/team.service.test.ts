import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";

const { mockUserRepo, mockSubscriptionService } = vi.hoisted(() => ({
    mockUserRepo: {
        listByInstitute: vi.fn(),
        findByEmail: vi.fn(),
        countByInstitute: vi.fn(),
        updateByEmail: vi.fn(),
        create: vi.fn(),
        updateByIdAndInstitute: vi.fn(),
        removeByIdAndInstitute: vi.fn(),
    },
    mockSubscriptionService: {
        getSubscription: vi.fn(),
    },
}));

vi.mock("@/features/auth/repositories/user.repo", () => ({
    userRepository: mockUserRepo,
}));

vi.mock("@/features/subscription/services/subscription.service", () => ({
    subscriptionService: mockSubscriptionService,
}));

import { teamService } from "@/features/team/services/team.service";

describe("teamService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("blocks non-owner from creating members", async () => {
        await expect(
            teamService.createMember("inst1", "VIEWER", { email: "a@b.com", role: "VIEWER" })
        ).rejects.toThrow(AppError);
    });

    it("blocks user assigned to another institute", async () => {
        mockUserRepo.findByEmail.mockResolvedValue({ instituteId: "other" });
        await expect(
            teamService.createMember("inst1", "OWNER", { email: "a@b.com", role: "MANAGER" })
        ).rejects.toThrow(AppError);
    });

    it("blocks when plan user limit reached", async () => {
        mockUserRepo.findByEmail.mockResolvedValue(null);
        mockSubscriptionService.getSubscription.mockResolvedValue({ userLimit: 1 });
        mockUserRepo.countByInstitute.mockResolvedValue(1);

        await expect(
            teamService.createMember("inst1", "OWNER", { email: "a@b.com", role: "MANAGER" })
        ).rejects.toThrow(AppError);
    });

    it("updates existing user in same institute", async () => {
        mockUserRepo.findByEmail.mockResolvedValue({ instituteId: "inst1", name: "Old" });
        mockUserRepo.updateByEmail.mockResolvedValue({ id: "u1" });

        const result = await teamService.createMember("inst1", "OWNER", { email: "a@b.com", role: "MANAGER", name: "New" });
        expect(mockUserRepo.updateByEmail).toHaveBeenCalled();
        expect(result).toEqual({ id: "u1" });
    });

    it("creates a new member when seat is available", async () => {
        mockUserRepo.findByEmail.mockResolvedValue(null);
        mockSubscriptionService.getSubscription.mockResolvedValue({ userLimit: 5 });
        mockUserRepo.countByInstitute.mockResolvedValue(2);
        mockUserRepo.create.mockResolvedValue({ id: "u2" });

        const result = await teamService.createMember("inst1", "OWNER", { email: "new@b.com", role: "VIEWER" });
        expect(mockUserRepo.create).toHaveBeenCalled();
        expect(result).toEqual({ id: "u2" });
    });

    it("blocks owner self role update", async () => {
        await expect(teamService.updateMemberRole("inst1", "OWNER", "u1", "u1", "VIEWER")).rejects.toThrow(AppError);
    });

    it("returns not found when role update does not change rows", async () => {
        mockUserRepo.updateByIdAndInstitute.mockResolvedValue({ count: 0 });
        await expect(teamService.updateMemberRole("inst1", "OWNER", "u0", "u1", "VIEWER")).rejects.toThrow(AppError);
    });

    it("blocks owner self remove", async () => {
        await expect(teamService.removeMember("inst1", "OWNER", "u1", "u1")).rejects.toThrow(AppError);
    });

    it("removes member", async () => {
        mockUserRepo.removeByIdAndInstitute.mockResolvedValue({ count: 1 });
        const result = await teamService.removeMember("inst1", "OWNER", "u0", "u2");
        expect(result).toEqual({ deleted: true });
    });
});
