import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, ChartNoAxesCombined, FileSpreadsheet, Funnel } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import Section from "@/components/layout/Section";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Resources - Classes360",
    description: "Practical resources to improve admission workflows for coaching institutes in India.",
};

const resources = [
    {
        title: "How to increase admissions in coaching institutes",
        category: "Admissions",
        icon: ChartNoAxesCombined,
    },
    {
        title: "How to track leads for tuition classes",
        category: "Lead Management",
        icon: Funnel,
    },
    {
        title: "Excel vs admission management platform for coaching institutes",
        category: "Operations",
        icon: FileSpreadsheet,
    },
    {
        title: "How to build admission funnel for NEET institute",
        category: "Playbook",
        icon: BookOpenCheck,
    },
];

export default function ResourcesPage() {
    return (
        <PageContainer>
            <div className="max-w-2xl space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resources</p>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">Practical Guides for Institute Growth</h1>
                <p className="text-sm text-muted-foreground md:text-base">
                    We publish practical playbooks for institute owners and admission teams.
                </p>
            </div>

            <Section>
                <div className="grid gap-4 md:grid-cols-2">
                    {resources.map((resource) => {
                        const Icon = resource.icon;

                        return (
                            <Card key={resource.title} className="border-border bg-card">
                                <CardContent className="p-4">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        <Icon className="h-3.5 w-3.5" aria-hidden />
                                        {resource.category}
                                    </div>
                                    <h2 className="mt-4 text-lg font-semibold text-foreground">{resource.title}</h2>
                                    <Link
                                        href="/help"
                                        className="mt-4 inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                        Read guide
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </Section>
        </PageContainer>
    );
}
