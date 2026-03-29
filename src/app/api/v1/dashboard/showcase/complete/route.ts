import { NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { userRepository } from "@/features/auth/userDataApi";

export async function POST() {
    const session = await readSessionFromCookie();
    if (!session?.userId) {
        return NextResponse.json(
            { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
            { status: 401 }
        );
    }

    await userRepository.updateFirstLogin(session.userId, false);

    return NextResponse.json({ success: true });
}

