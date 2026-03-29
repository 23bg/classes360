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
    const routeLog = createRouteLogger("/api/v1/auth/verification#POST", req);

    try {
        const body = await req.json();
        const input = schema.parse(body);

        const result = await authService.verifyOtp({
            email: input.email,
            otp: input.otp,
            purpose: OtpPurpose.VERIFY_EMAIL,
        });

        routeLog.info("verification_succeeded", { email: input.email });

        return NextResponse.json(ok(result));
    } catch (error) {
        routeLog.error("verification_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(fail(appError.message), { status: appError.statusCode });
    }
}
