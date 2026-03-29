import { NextResponse } from "next/server";
import { clearStudentSessionCookie } from "@/lib/auth/student-auth";

export async function POST() {
    await clearStudentSessionCookie();
    return NextResponse.json({ success: true });
}
