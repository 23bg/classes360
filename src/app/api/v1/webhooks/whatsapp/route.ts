import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { prisma } from "@/lib/db/prisma";
import { sendWhatsAppText } from "@/lib/whatsappApi";
import { normalizePhone } from "@/lib/utils/phone";
import { createRouteLogger } from "@/lib/api/route-logger";
import { DEMO_VIDEO_URL } from "@/constants/external-links";

type WhatsAppWebhookMessage = {
    id?: string;
    from?: string;
    type?: string;
    text?: {
        body?: string;
    };
};

type WhatsAppWebhookPayload = {
    entry?: Array<{
        changes?: Array<{
            value?: {
                messages?: WhatsAppWebhookMessage[];
                statuses?: Array<{
                    id?: string;
                    status?: string;
                    recipient_id?: string;
                }>;
            };
        }>;
    }>;
};

export async function GET(req: NextRequest) {
    const mode = req.nextUrl.searchParams.get("hub.mode");
    const token = req.nextUrl.searchParams.get("hub.verify_token");
    const challenge = req.nextUrl.searchParams.get("hub.challenge");

    if (
        mode === "subscribe" &&
        token &&
        env.WHATSAPP_VERIFY_TOKEN &&
        token === env.WHATSAPP_VERIFY_TOKEN
    ) {
        return new NextResponse(challenge || "", { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/webhooks/whatsapp#POST", req);

    try {
        const body = (await req.json()) as WhatsAppWebhookPayload;

        const messages =
            body.entry
                ?.flatMap((entry) => entry.changes ?? [])
                .flatMap((change) => change.value?.messages ?? []) ?? [];

        const statuses =
            body.entry
                ?.flatMap((entry) => entry.changes ?? [])
                .flatMap((change) => change.value?.statuses ?? []) ?? [];

        for (const statusEvent of statuses) {
            if (!statusEvent.id) {
                continue;
            }

            const updated = await prisma.whatsAppMessage.updateMany({
                where: { providerId: statusEvent.id },
                data: { status: (statusEvent.status || "UNKNOWN").toUpperCase() },
            });

            if (updated.count === 0) {
                await prisma.whatsAppMessage.create({
                    data: {
                        phone: normalizePhone(statusEvent.recipient_id || ""),
                        message: "",
                        direction: "OUTBOUND",
                        status: (statusEvent.status || "UNKNOWN").toUpperCase(),
                        providerId: statusEvent.id,
                        payload: statusEvent,
                    },
                });
            }
        }

        if (messages.length === 0) {
            routeLog.info("whatsapp_webhook_no_messages");
            return new NextResponse("EVENT_RECEIVED", { status: 200 });
        }

        for (const message of messages) {
            const sender = normalizePhone(message.from || "");
            const text = message.text?.body?.trim() || "";

            await prisma.whatsAppMessage.create({
                data: {
                    phone: sender,
                    message: text,
                    direction: "INBOUND",
                    status: "RECEIVED",
                    providerId: message.id || null,
                    payload: message,
                },
            });

            if (text && text.toLowerCase().includes("demo")) {
                const reply = `Watch demo here: ${DEMO_VIDEO_URL}`;
                const response = await sendWhatsAppText(sender, reply);

                await prisma.whatsAppMessage.create({
                    data: {
                        phone: sender,
                        message: reply,
                        direction: "OUTBOUND",
                        status: "SENT",
                        providerId: response.messages?.[0]?.id || null,
                        payload: response,
                    },
                });
            }
        }

        return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } catch (error) {
        routeLog.error("whatsapp_webhook_failed", error);
        return NextResponse.json(
            {
                success: false,
                error: { code: "WHATSAPP_WEBHOOK_FAILED", message: "Failed to process WhatsApp webhook" },
            },
            { status: 500 }
        );
    }
}

