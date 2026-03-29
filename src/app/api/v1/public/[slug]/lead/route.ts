import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { leadService } from "@/server/leadsApi";
import { enforceRateLimit } from "@/lib/utils/rateLimit";
import { env } from "@/lib/config/env";
import { toAppError } from "@/lib/utils/error";
import { createRouteLogger } from "@/lib/api/route-logger";

const leadSchema = z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().trim().max(120).email().optional(),
    course: z.string().trim().max(120).optional(),
    message: z.string().trim().max(1024).optional(),
    source: z.string().trim().max(50).optional(),
});

type RouteContext = {
    params: Promise<{ slug: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
    const routeLog = createRouteLogger("/api/v1/public/[slug]/lead#POST", req);
    try {
        const { slug } = await context.params;
        routeLog.info("public_lead_submit_started", { slug });

        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const rate = enforceRateLimit(`lead:${ip}:${slug}`, env.LEAD_RATE_LIMIT_PER_MIN, 60_000);
        if (!rate.ok) {
            routeLog.warn("public_lead_submit_rate_limited", { slug, retryAfter: rate.retryAfter });
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "RATE_LIMITED",
                        message: `Too many submissions. Retry in ${rate.retryAfter}s`,
                    },
                },
                { status: 429 }
            );
        }

        const contentType = req.headers.get("content-type") ?? "";
        let payload: Record<string, string | undefined> = {};

        if (contentType.includes("application/json")) {
            payload = (await req.json()) as Record<string, string | undefined>;
        } else {
            const formData = await req.formData();
            payload = {
                name: formData.get("name")?.toString(),
                phone: formData.get("phone")?.toString(),
                email: formData.get("email")?.toString(),
                course: formData.get("course")?.toString(),
                message: formData.get("message")?.toString(),
                source: formData.get("source")?.toString(),
            };
        }

        const input = leadSchema.parse(payload);
        const lead = await leadService.createLeadBySlug(slug, input);

        routeLog.info("public_lead_submit_succeeded", { slug, instituteId: lead.instituteId, leadId: lead.id });

        if (contentType.includes("application/json")) {
            return NextResponse.json({ success: true, data: lead });
        }

        return NextResponse.redirect(new URL(`/${slug}/lead?success=1`, req.url));
    } catch (error) {
        routeLog.error("public_lead_submit_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: appError.code,
                    message: appError.message,
                    details: appError.details,
                },
            },
            { status: appError.statusCode }
        );
    }
}

