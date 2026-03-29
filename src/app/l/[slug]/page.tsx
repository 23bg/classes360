import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

type ShortLinkRedirectPageProps = {
    params: Promise<{ slug: string }>;
};

export default async function ShortLinkRedirectPage({ params }: ShortLinkRedirectPageProps) {
    const { slug } = await params;
    const link = await prisma.shortLink.findUnique({ where: { slug } });

    if (!link) {
        notFound();
    }

    await prisma.shortLink.update({
        where: { id: link.id },
        data: { clickCount: { increment: 1 } },
    });

    redirect(link.originalUrl);
}
