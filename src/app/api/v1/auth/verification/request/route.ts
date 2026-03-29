import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/features/auth/authDomainApi";
import { createRouteLogger } from "@/lib/api/route-logger";
import { toAppError } from "@/lib/utils/error";
import { fail, ok } from "@/modules/auth/api/responses";
import { z } from "zod";

const schema = z.object({
    email: z.string().email(),
});

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/auth/verification/request#POST", req);

    try {
        const body = await req.json();
        const input = schema.parse(body);
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

        const result = await authService.ensureEmailVerificationOtp({
            email: input.email,
            ip,
        });

        routeLog.info("verification_request_succeeded", { email: input.email });

        return NextResponse.json(ok(result));
    } catch (error) {
        routeLog.error("verification_request_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(fail(appError.message), { status: appError.statusCode });
    }
}
