import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { edgeLogger, getOrCreateRequestId, REQUEST_ID_HEADER } from "@/lib/request-logger";

const ONBOARDING_PATH = "/onboarding";
const LOGIN_PATH = "/login";

export function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const requestId = getOrCreateRequestId(req.headers);

    edgeLogger.info("middleware_protected_route", {
        requestId,
        method: req.method,
        pathname,
    });

    // === ONLY JOB: PROTECT DASHBOARD ROUTES ===

    // 1. Read access token from cookie
    const token = req.cookies.get("access_token")?.value;

    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!token) {
        if (refreshToken) {
            const refreshUrl = new URL("/api/v1/auth/refresh", req.url);
            refreshUrl.searchParams.set("next", pathname);
            edgeLogger.info("redirect_to_refresh", { requestId, from: pathname, reason: "missing_access_token" });
            return NextResponse.redirect(refreshUrl);
        }

        const loginUrl = new URL(LOGIN_PATH, req.url);
        loginUrl.searchParams.set("next", pathname);
        edgeLogger.info("redirect_to_login", { requestId, from: pathname });
        return NextResponse.redirect(loginUrl);
    }

    // 2. Verify token is valid (lightweight JWT decode)
    const session = verifyAccessToken(token);

    if (!session) {
        if (refreshToken) {
            const refreshUrl = new URL("/api/v1/auth/refresh", req.url);
            refreshUrl.searchParams.set("next", pathname);
            edgeLogger.info("redirect_to_refresh", { requestId, from: pathname, reason: "invalid_access_token" });
            return NextResponse.redirect(refreshUrl);
        }

        const loginUrl = new URL(LOGIN_PATH, req.url);
        loginUrl.searchParams.set("next", pathname);
        edgeLogger.info("invalid_token", { requestId, from: pathname });
        return NextResponse.redirect(loginUrl);
    }

    // 3. IF onboarding route, only allow if NOT onboarded
    if (pathname.startsWith(ONBOARDING_PATH)) {
        if (session.isOnboarded) {
            // Already onboarded → redirect home
            edgeLogger.info("already_onboarded", { requestId });
            return NextResponse.redirect(new URL("/", req.url));
        }
        // Allow onboarding flow
        return NextResponse.next();
    }

    // 4. IF dashboard route, require onboarded
    if (session && !session.isOnboarded) {
        edgeLogger.info("onboarding_required", { requestId, from: pathname });
        return NextResponse.redirect(new URL(ONBOARDING_PATH, req.url));
    }

    // ✅ All checks passed → allow access
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/overview/:path*",
        "/leads/:path*",
        "/students/:path*",
        "/upload/:path*",
        "/team/:path*",
        "/teachers/:path*",
        "/courses/:path*",
        "/batches/:path*",
        "/defaulters/:path*",
        "/fees/:path*",
        "/institute/:path*",
        "/settings/:path*",
        "/billing/:path*",
        "/profile/:path*",
        "/onboarding/:path*",
        "/api/v1/private/:path*",
    ],
};

