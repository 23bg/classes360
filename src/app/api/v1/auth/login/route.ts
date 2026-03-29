import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/features/auth/authDomainApi";
import { createRouteLogger } from "@/lib/api/route-logger";
import { toAppError } from "@/lib/utils/error";
import { fail, ok } from "@/modules/auth/api/responses";
import { loginRequestSchema } from "@/modules/auth/api/schemas";

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/auth/login#POST", req);

    try {
        const body = await req.json();
        const input = loginRequestSchema.parse(body);
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

        const result = await authService.login({
            email: input.email,
            password: input.password,
            ip,
        });

        routeLog.info("login_succeeded", {
            email: input.email,
            mfaRequired: result.mfaRequired,
            redirectTo: result.redirectTo ?? null,
        });

        return NextResponse.json(ok(result));
    } catch (error) {
        routeLog.error("login_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(fail(appError.message), { status: appError.statusCode });
    }
}
