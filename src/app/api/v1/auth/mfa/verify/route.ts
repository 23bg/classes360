import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/features/auth/authDomainApi";
import { createRouteLogger } from "@/lib/api/route-logger";
import { toAppError } from "@/lib/utils/error";
import { fail, ok } from "@/modules/auth/api/responses";
import { OtpPurpose } from "@/modules/auth/domain/otpPurpose";
import { z } from "zod";

const schema = z.object({
    email: z.string().email(),
    otp: z.string().regex(/^\d{5}$/),
});

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/auth/mfa/verify#POST", req);

    try {
        const body = await req.json();
        const input = schema.parse(body);

        const result = await authService.completeMfaLogin({
            email: input.email,
            otp: input.otp,
            purpose: OtpPurpose.MFA,
        });

        routeLog.info("mfa_verify_succeeded", { email: input.email, redirectTo: result.redirectTo });

        return NextResponse.json(ok(result));
    } catch (error) {
        routeLog.error("mfa_verify_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(fail(appError.message), { status: appError.statusCode });
    }
}
