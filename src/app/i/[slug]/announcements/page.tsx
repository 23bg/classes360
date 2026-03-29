import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildInstituteMetadata } from "@/app/i/[slug]/_lib/metadata";
import { getPublicInstitute } from "@/app/i/[slug]/_lib/public-institute";
import { InstitutePageShell } from "@/modules/institute/components/public-site/InstituteWebsiteSections";

type InstituteAnnouncementsPageProps = {
    params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: InstituteAnnouncementsPageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const institute = await getPublicInstitute(slug);
        return buildInstituteMetadata({
            institute,
            titleSuffix: "Announcements",
            description: `Latest announcements and updates from ${institute.name || "Institute"}.`,
        });
    } catch {
        return { title: "Announcements" };
    }
}

export default async function InstituteAnnouncementsPage({ params }: InstituteAnnouncementsPageProps) {
    const { slug } = await params;
    const institute = await getPublicInstitute(slug).catch(() => notFound());
    const announcements = institute.announcements || [];

    return (
        <InstitutePageShell
            slug={slug}
            institute={institute}
            title="Announcements"
            subtitle="Updates published from the institute dashboard"
        >
            {!announcements.length ? (
                <Card>
                    <CardContent className="pt-6 text-sm text-muted-foreground">
                        No announcements yet. Please check back soon.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {announcements.map((item, index) => (
                        <Card key={`${item.title}-${index}`}>
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>
                                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">{item.body}</CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </InstitutePageShell>
    );
}
