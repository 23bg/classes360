import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ROUTES from "@/constants/routes";
import PageContainer from "@/components/layout/PageContainer";
import Section from "@/components/layout/Section";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
    const title = "Features | Classes360";
    const description = "System architecture for coaching institute admission operations.";

    return {
        title,
        description,
        alternates: {
            canonical: "/features",
        },
        openGraph: {
            title,
            description,
            url: "/features",
            type: "website",
        },
        twitter: {
            title,
            description,
            card: "summary_large_image",
        },
    };
}

export default async function FeaturesPage() {
    const architectureSections = [
        {
            title: "Admission Flow",
            items: ["Capture enquiries", "Assign follow-ups", "Track conversion stages"],
        },
        {
            title: "Student Management",
            items: ["Student records", "Batch and course mapping", "Fee and payment updates"],
        },
        {
            title: "Team Management",
            items: ["Role-based access", "Lead ownership", "Cross-team visibility"],
        },
        {
            title: "Communication",
            items: ["WhatsApp alerts", "Internal notifications", "Follow-up reminders"],
        },
        {
            title: "Integrations",
            items: ["WhatsApp Business", "Razorpay", "Email"],
        },
    ];

    return (
        <PageContainer>
            <div className="max-w-2xl space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">System Architecture</p>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">One architecture for admission operations</h1>
                <p className="text-sm text-muted-foreground">Classes360 connects admissions, students, teams, communication, and integrations into one structured workflow.</p>
            </div>

            <Section>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {architectureSections.map((section) => (
                        <FeatureCard key={section.title} title={section.title} items={section.items} />
                    ))}
                </div>
            </Section>

            <Section>
                <Card className="border-border bg-card">
                    <CardContent className="p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-medium text-foreground">Explore core feature modules</h2>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button asChild size="sm" className="w-full sm:w-auto">
                                <Link href={ROUTES.FEATURE_DETAILS.LEAD_MANAGEMENT} className="inline-flex items-center gap-2">
                                    Lead Management <ArrowRight className="h-4 w-4" aria-hidden />
                                </Link>
                            </Button>

                            <Button asChild size="sm" className="w-full sm:w-auto">
                                <Link href={ROUTES.FEATURE_DETAILS.STUDENT_RECORDS} className="inline-flex items-center gap-2">
                                    Student Records <ArrowRight className="h-4 w-4" aria-hidden />
                                </Link>
                            </Button>

                            <Button asChild size="sm" className="w-full sm:w-auto">
                                <Link href={ROUTES.FEATURE_DETAILS.PUBLIC_INSTITUTE_PAGE} className="inline-flex items-center gap-2">
                                    Public Institute Page <ArrowRight className="h-4 w-4" aria-hidden />
                                </Link>
                            </Button>

                            <Button asChild size="sm" className="w-full sm:w-auto">
                                <Link href={ROUTES.FEATURE_DETAILS.SUBSCRIPTION_BILLING} className="inline-flex items-center gap-2">
                                    Subscription Billing <ArrowRight className="h-4 w-4" aria-hidden />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Section>
        </PageContainer>
    );
}
