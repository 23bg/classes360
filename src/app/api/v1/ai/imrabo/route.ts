import { NextRequest, NextResponse } from "next/server";
import { createRouteLogger } from "@/lib/api/route-logger";
import { env } from "@/lib/config/env";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { buildHelpContext } from "@/modules/ai/server/help-rag";
import { buildImraboPrompt } from "@/modules/ai/server/imrabo-prompt";

type ChatMessage = {
    role: "assistant" | "user";
    text: string;
};

type ChatRequestBody = {
    message?: string;
    history?: ChatMessage[];
};

const GEMINI_DEFAULT_MODEL = "gemini-1.5-flash";

const sanitizeMessage = (value: string) => value.replace(/[\u0000-\u001f\u007f]/g, "").trim();

const isBlockedPrompt = (value: string) => {
    const blockedPatterns = [
        /password/i,
        /token/i,
        /secret/i,
        /student\s+phone/i,
        /student\s+email/i,
        /razorpay/i,
    ];

    return blockedPatterns.some((pattern) => pattern.test(value));
};

const callGemini = async (input: { systemInstruction: string; userPrompt: string }) => {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = env.GEMINI_MODEL || GEMINI_DEFAULT_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: input.systemInstruction }],
            },
            contents: [
                {
                    role: "user",
                    parts: [{ text: input.userPrompt }],
                },
            ],
            generationConfig: {
                temperature: 0.2,
                topP: 0.8,
                maxOutputTokens: 700,
            },
        }),
    });

    const data = (await response.json()) as {
        candidates?: Array<{
            content?: {
                parts?: Array<{ text?: string }>;
            };
        }>;
        error?: { message?: string };
    };

    if (!response.ok) {
        throw new Error(data.error?.message || "Gemini request failed");
    }

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join(" ").trim();
    return text || "I could not generate an answer right now. Please open Help Center for guidance.";
};

const toStreamResponse = (text: string) => {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const chunks = text.match(/.{1,40}/g) ?? [text];
            for (const chunk of chunks) {
                controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
};

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/ai/imrabo#POST", req);

    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const body = (await req.json().catch(() => ({}))) as ChatRequestBody;
        const message = sanitizeMessage(body.message || "");
        const history = Array.isArray(body.history) ? body.history : [];

        if (!message) {
            return NextResponse.json(
                { success: false, error: { code: "MESSAGE_REQUIRED", message: "Message is required" } },
                { status: 400 }
            );
        }

        if (message.length > 1000) {
            return NextResponse.json(
                { success: false, error: { code: "MESSAGE_TOO_LONG", message: "Message too long" } },
                { status: 400 }
            );
        }

        if (isBlockedPrompt(message)) {
            return toStreamResponse(
                "I can help with product usage and workflows. For account-sensitive details, please use dashboard settings or support."
            );
        }

        const { docs, contextText } = buildHelpContext(message, 3);

        const prompt = buildImraboPrompt({
            userMessage: message,
            documentationContext: contextText,
            history,
        });

        const answer = await callGemini(prompt);

        routeLog.info("imrabo_response_generated", {
            docsUsed: docs.map((doc) => doc.slug),
            historyCount: history.length,
        });

        const withCitations = docs.length
            ? `${answer}\n\nRelated help: ${docs.map((doc) => `help/${doc.slug}`).join(", ")}`
            : `${answer}\n\nI could not find a direct doc match. Please open Help Center for exact steps.`;

        return toStreamResponse(withCitations);
    } catch (error) {
        routeLog.error("imrabo_chat_failed", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "IMRABO_CHAT_FAILED",
                    message: "Failed to process chat request",
                },
            },
            { status: 500 }
        );
    }
}
