import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/auth";
import { createRouteLogger } from "@/lib/api/route-logger";
import { logoutUseCase } from "@/modules/auth/application/logout.useCase";
import { fail, ok } from "@/modules/auth/api/responses";

export async function POST() {
    const routeLog = createRouteLogger("/api/v1/auth/logout#POST");
    try {
        routeLog.info("logout_started");
        const result = await logoutUseCase();

        // Also clear legacy session cookie for backward compatibility
        await clearSessionCookie();

        routeLog.info("logout_succeeded", { userId: result.userId });

        return NextResponse.json(ok({ loggedOut: true }));
    } catch (error) {
        routeLog.error("logout_failed", error);
        return NextResponse.json(fail("Logout failed"), { status: 500 });
    }
}
