import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const createShortLinkSchema = z.object({
    originalUrl: z.string().trim().url("Enter a valid URL"),
    customSlug: z
        .string()
        .trim()
        .max(40)
        .regex(/^[a-zA-Z0-9-]*$/, "Slug can only contain letters, numbers and hyphens")
        .optional()
        .or(z.literal("")),
});

const generateSlug = () => Math.random().toString(36).slice(2, 8);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = createShortLinkSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: parsed.error.issues[0]?.message ?? "Invalid payload",
                    },
                },
                { status: 400 }
            );
        }

        const requestedSlug = parsed.data.customSlug?.toLowerCase().trim();
        const originalUrl = parsed.data.originalUrl.trim();

        let slug = requestedSlug || generateSlug();
        let attempts = 0;

        while (attempts < 5) {
            const exists = await prisma.shortLink.findUnique({ where: { slug } });
            if (!exists) break;

            if (requestedSlug) {
                return NextResponse.json(
                    {
                        success: false,
                        error: { code: "SLUG_EXISTS", message: "Custom slug is already taken" },
                    },
                    { status: 409 }
                );
            }

            slug = generateSlug();
            attempts += 1;
        }

        const created = await prisma.shortLink.create({
            data: {
                slug,
                originalUrl,
            },
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://classes360.online";

        return NextResponse.json({
            success: true,
            data: {
                id: created.id,
                slug: created.slug,
                originalUrl: created.originalUrl,
                shortUrl: `${baseUrl.replace(/\/$/, "")}/l/${created.slug}`,
                clickCount: created.clickCount,
                createdAt: created.createdAt,
            },
        });
    } catch {
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Unable to create short link" } },
            { status: 500 }
        );
    }
}
