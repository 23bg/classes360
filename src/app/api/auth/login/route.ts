import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json(
        {
            success: false,
            error: "LEGACY_AUTH_ROUTE_DEPRECATED",
            message: "Use /api/v1/auth/login instead.",
        },
        { status: 410 }
    );
}
