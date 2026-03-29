import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, readSessionFromCookie, setSessionCookie } from "@/lib/auth/auth";
import { canWriteInstituteData } from "@/lib/auth/permissions";
import { instituteService } from "@/features/institute/instituteApi";
import { toAppError } from "@/lib/utils/error";

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.userId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        if (!canWriteInstituteData(session.role)) {
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
                { status: 403 }
            );
        }

        const body = (await req.json()) as {
            name: string;
            phone: string;
            address: {
                addressLine1?: string;
                addressLine2?: string;
                city?: string;
                state?: string;
                region?: string;
                postalCode?: string;
                country?: string;
                countryCode?: string;
            } | string;
            addressLine1?: string;
            addressLine2?: string;
            city?: string;
            state?: string;
            region?: string;
            postalCode?: string;
            country?: string;
            countryCode?: string;
            whatsapp?: string;
            description?: string;
            website?: string;
            facebook?: string;
            instagram?: string;
            youtube?: string;
            linkedin?: string;
        };

        const institute = await instituteService.getInstitute(session.userId);
        const data = await instituteService.completeOnboarding(institute.id, body);

        const nextToken = createSessionToken({
            ...session,
            instituteId: institute.id,
            isOnboarded: true,
        });
        await setSessionCookie(nextToken);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

