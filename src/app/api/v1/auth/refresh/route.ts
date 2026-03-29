import { NextResponse } from "next/server";
import { fail } from "@/modules/auth/api/responses";
import { refreshTokenController } from "@/modules/auth/api/refreshToken.controller";
import { refreshSessionUseCase } from "@/modules/auth/application/refreshSession.useCase";

/**
 * POST /api/v1/auth/refresh
 * Refresh the access token using the refresh token
 */
export async function POST() {
    try {
        return await refreshTokenController();
    } catch (error) {
        console.error("[auth/refresh]", error);
        return NextResponse.json(fail("Internal server error"), { status: 500 });
    }
}

/**
 * GET /api/v1/auth/refresh?next=/target
 * Used by middleware/SSR to refresh before redirecting user to login.
 */
export async function GET(req: Request) {
    try {
        const nextUrl = new URL(req.url);
        const nextPath = nextUrl.searchParams.get("next") || "/";
        const refreshed = await refreshSessionUseCase();

        if (!refreshed) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("next", nextPath);
            return NextResponse.redirect(loginUrl);
        }

        return NextResponse.redirect(new URL(nextPath, req.url));
    } catch {
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
    }
}
