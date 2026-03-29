import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/features/auth/authDomainApi";
import { createRouteLogger } from "@/lib/api/route-logger";
import { toAppError } from "@/lib/utils/error";
import { fail, ok } from "@/modules/auth/api/responses";
import { resetPasswordRequestSchema } from "@/modules/auth/api/schemas";

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/auth/password-reset#POST", req);

    try {
        const body = await req.json();
        const input = resetPasswordRequestSchema.parse(body);

        const result = await authService.resetPassword({
            email: input.email,
            otp: input.otp,
            newPassword: input.newPassword,
        });

        routeLog.info("password_reset_succeeded", { email: input.email });

        return NextResponse.json(ok(result));
    } catch (error) {
        routeLog.error("password_reset_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(fail(appError.message), { status: appError.statusCode });
    }
}
