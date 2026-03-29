import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/features/auth/authDomainApi";
import { toAppError } from "@/lib/utils/error";
import { createRouteLogger } from "@/lib/api/route-logger";
import { fail, ok } from "@/modules/auth/api/responses";
import { requestOtpRequestSchema } from "@/modules/auth/api/schemas";
import { OtpPurpose } from "@/modules/auth/domain/otpPurpose";

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/auth/request-otp#POST", req);
    try {
        const body = await req.json();
        const input = requestOtpRequestSchema.parse(body);
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

        routeLog.info("request_otp_started", { email: input.email, purpose: input.purpose, ip });

        const result = await authService.requestOtp({ email: input.email, ip, purpose: input.purpose as OtpPurpose });

        routeLog.info("request_otp_succeeded", { email: input.email, purpose: input.purpose });

        return NextResponse.json(ok(result));
    } catch (error) {
        routeLog.error("request_otp_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(fail(appError.message), { status: appError.statusCode });
    }
}


