import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { verifyStudentSessionToken } from "@/lib/auth/student-auth";

const portalRoutes = [
    "/overview",
    "/leads",
    "/students",
    "/upload",
    "/team",
    "/teachers",
    "/courses",
    "/batches",
    "/defaulters",
    "/fees",
    "/institute",
    "/settings",
    "/billing",
    "/profile",
];

const studentRoutes = ["/student"];

const isProtectedRoute = (pathname: string) =>
    portalRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    studentRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    if (!isProtectedRoute(pathname)) {
        return NextResponse.next();
    }

    const accessToken = req.cookies.get("access_token")?.value;
    const refreshToken = req.cookies.get("refresh_token")?.value;
    const studentToken = req.cookies.get("student_session_token")?.value;

    if (pathname.startsWith("/student")) {
        const studentSession = studentToken ? verifyStudentSessionToken(studentToken) : null;
        if (studentSession) {
            return NextResponse.next();
        }

        const loginUrl = new URL("/student-login", req.url);
        return NextResponse.redirect(loginUrl);
    }

    if (accessToken) {
        const session = verifyAccessToken(accessToken);
        if (session) {
            return NextResponse.next();
        }
    }

    if (refreshToken) {
        const refreshUrl = new URL("/api/v1/auth/refresh", req.url);
        refreshUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(refreshUrl);
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
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
        "/student/:path*",
    ],
};
