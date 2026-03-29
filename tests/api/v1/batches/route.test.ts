import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/v1/batches/route";

const { mockReadSessionFromCookie, mockBatchService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockBatchService: {
        getBatches: vi.fn(),
        getBatchesByCourse: vi.fn(),
        createBatch: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/features/batch/services/batch.service", () => ({
    batchService: mockBatchService,
}));

describe("/api/v1/batches", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("GET returns unauthorized without session", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);

        const response = await GET(new NextRequest("http://localhost/api/v1/batches") as never);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
    });

    it("GET filters by courseId when provided", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockBatchService.getBatchesByCourse.mockResolvedValue([{ id: "b1" }]);

        const response = await GET(new NextRequest("http://localhost/api/v1/batches?courseId=c1") as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockBatchService.getBatchesByCourse).toHaveBeenCalledWith("inst1", "c1");
    });

    it("POST returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER" });

        const request = new Request("http://localhost/api/v1/batches", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Morning" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FORBIDDEN");
        expect(mockBatchService.createBatch).not.toHaveBeenCalled();
    });

    it("POST creates batch for writer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockBatchService.createBatch.mockResolvedValue({ id: "b1" });

        const request = new Request("http://localhost/api/v1/batches", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Morning", courseId: "c1" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockBatchService.createBatch).toHaveBeenCalledWith({ instituteId: "inst1", name: "Morning", courseId: "c1" });
    });

    it("POST returns service error status", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockBatchService.createBatch.mockRejectedValue(new AppError("Duplicate", 409, "DUPLICATE_BATCH"));

        const request = new Request("http://localhost/api/v1/batches", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Morning", courseId: "c1" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("DUPLICATE_BATCH");
    });
});
