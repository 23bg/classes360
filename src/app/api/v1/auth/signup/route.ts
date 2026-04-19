import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/features/auth/authDomainApi";
import { createRouteLogger } from "@/lib/api/route-logger";
import { toAppError } from "@/lib/utils/error";
import { fail, ok } from "@/features/auth/api/responses";
import { signupRequestSchema } from "@/features/auth/api/schemas";

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/auth/signup#POST", req);

    try {
        const body = await req.json();
        const input = signupRequestSchema.parse(body);
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

        const result = await authService.signup({
            name: input.name,
            phoneNumber: input.phoneNumber,
            email: input.email,
            ip,
        });

        routeLog.info("signup_succeeded", { email: input.email });

        return NextResponse.json(ok(result), { status: 201 });
    } catch (error) {
        routeLog.error("signup_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(fail(appError.message), { status: appError.statusCode });
    }
}

