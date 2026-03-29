import { NextResponse } from "next/server";
import { refreshSessionUseCase } from "@/modules/auth/application/refreshSession.useCase";
import { fail, ok } from "@/modules/auth/api/responses";

export const refreshTokenController = async () => {
    const session = await refreshSessionUseCase();
    if (!session) {
        return NextResponse.json(fail("Invalid session"), { status: 401 });
    }

    return NextResponse.json(ok({ refreshed: true }));
};
