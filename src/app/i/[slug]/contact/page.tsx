import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildInstituteMetadata } from "@/app/i/[slug]/_lib/metadata";
import { getInstituteAddress, getPublicInstitute, getWhatsAppUrl } from "@/app/i/[slug]/_lib/public-institute";
import { EnquirySection, InstitutePageShell, LocationBlock } from "@/modules/institute/components/public-site/InstituteWebsiteSections";

type InstituteContactPageProps = {
    params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: InstituteContactPageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const institute = await getPublicInstitute(slug);
        return buildInstituteMetadata({
            institute,
            titleSuffix: "Contact",
            description: `Contact ${institute.name || "Institute"} for admissions, address, WhatsApp, phone and counselling.`,
        });
    } catch {
        return { title: "Contact" };
    }
}

export default async function InstituteContactPage({ params }: InstituteContactPageProps) {
    const { slug } = await params;
    const institute = await getPublicInstitute(slug).catch(() => notFound());
    const address = getInstituteAddress(institute);
    const whatsappUrl = getWhatsAppUrl(institute);

    return (
        <InstitutePageShell
            slug={slug}
            institute={institute}
            title="Contact"
            subtitle="Address, map, phone, WhatsApp, email and enquiry form"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Institute Contact Details</CardTitle>
                    <CardDescription>{address || "Address will be updated soon."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>Phone: {institute.phone || "N/A"}</p>
                    <p>Email: {institute.email || "N/A"}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {institute.phone ? (
                            <Button asChild size="sm">
                                <a href={`tel:${institute.phone}`}>Call</a>
                            </Button>
                        ) : null}
                        {whatsappUrl ? (
                            <Button asChild size="sm" variant="secondary">
                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                    WhatsApp
                                </a>
                            </Button>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            <LocationBlock institute={institute} />

            <EnquirySection slug={slug} />
        </InstitutePageShell>
    );
}
