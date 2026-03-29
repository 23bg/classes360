import { NextResponse } from "next/server";
import { sendWhatsAppText } from "@/lib/whatsappApi";
import { normalizePhone } from "@/lib/utils/phone";

const DEFAULT_MESSAGE = "Hello, this is a WhatsApp test message from Classes360.";

export async function GET(req: Request) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { error: "Test route disabled in production" },
            { status: 403 }
        );
    }

    try {
        const url = new URL(req.url);
        const phone = url.searchParams.get("phone");
        const message = url.searchParams.get("message") || DEFAULT_MESSAGE;

        if (!phone) {
            return NextResponse.json(
                { error: "phone query parameter is required" },
                { status: 400 }
            );
        }

        const normalizedPhone = normalizePhone(phone);
        const result = await sendWhatsAppText(normalizedPhone, message);

        return NextResponse.json({
            success: true,
            phone: normalizedPhone,
            result,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to send message",
            },
            { status: 500 }
        );
    }
}

