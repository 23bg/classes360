"use client";

import { useEffect } from "react";
import { NextStep, NextStepProvider, useNextStep, type Tour } from "nextstepjs";
import ROUTES from "@/constants/routes";

type DashboardShowcaseTourProps = {
    enabled: boolean;
    children: React.ReactNode;
};

const dashboardTourSteps: Tour[] = [
    {
        tour: "dashboard-showcase",
        steps: [
            {
                icon: "👋",
                title: "Welcome to Classes360",
                content: "Manage admissions easily from one place.",
                selector: "#dashboard-brand",
                side: "right",
                showControls: true,
                showSkip: true,
            },
            {
                icon: "🎯",
                title: "Manage Leads",
                content: "Track every enquiry and follow up faster.",
                selector: "#dashboard-nav-leads",
                side: "right",
                nextRoute: ROUTES.DASHBOARD.LEADS,
                showControls: true,
                showSkip: true,
            },
            {
                icon: "🎓",
                title: "Track Students",
                content: "Keep student records organized and searchable.",
                selector: "#dashboard-nav-students",
                side: "right",
                nextRoute: ROUTES.DASHBOARD.STUDENTS,
                showControls: true,
                showSkip: true,
            },
            {
                icon: "📚",
                title: "Add Courses",
                content: "Set up your course catalog in minutes.",
                selector: "#dashboard-nav-courses",
                side: "right",
                nextRoute: ROUTES.DASHBOARD.COURSES,
                showControls: true,
                showSkip: true,
            },
            {
                icon: "🌐",
                title: "Public Institute Page",
                content: "Publish your institute profile and share your link.",
                selector: "#dashboard-nav-institute",
                side: "right",
                nextRoute: ROUTES.DASHBOARD.INSTITUTE,
                showControls: true,
                showSkip: true,
            },
            {
                icon: "✅",
                title: "Start Using Dashboard",
                content: "You are all set to run admissions on Classes360.",
                selector: "#dashboard-header",
                side: "bottom",
                nextRoute: ROUTES.DASHBOARD.ROOT,
                showControls: true,
                showSkip: true,
            },
        ],
    },
];

function DashboardShowcaseStarter({ enabled }: { enabled: boolean }) {
    const { startNextStep } = useNextStep();

    useEffect(() => {
        if (!enabled) return;
        startNextStep("dashboard-showcase");
    }, [enabled, startNextStep]);

    return null;
}

export default function DashboardShowcaseTour({ enabled, children }: DashboardShowcaseTourProps) {
    const completeShowcase = async () => {
        await fetch("/api/v1/dashboard/showcase/complete", { method: "POST" });
    };

    return (
        <NextStepProvider>
            <NextStep
                steps={dashboardTourSteps}
                onComplete={completeShowcase}
                onSkip={completeShowcase}
                overlayZIndex={120}
            >
                <DashboardShowcaseStarter enabled={enabled} />
                {children}
            </NextStep>
        </NextStepProvider>
    );
}
