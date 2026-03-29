import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { instituteService } from "@/features/institute/instituteApi";
import { userRepository } from "@/features/auth/userDataApi";
import { DashboardLayoutWithProviders } from "@/providers/DashboardLayoutWithProviders";

export const metadata: Metadata = {
    title: "Dashboard",
    description:
        "Classes360 Dashboard - Manage admissions, leads, students, teachers, and billing.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AppLayout({
    children
}: {
    children: React.ReactNode
}) {
    const session = await readSessionFromCookie();
    if (!session) {
        redirect("/login");
    }

    const institute = await instituteService.getOverview(session.instituteId);
    if (!institute.isOnboarded) {
        redirect("/onboarding");
    }

    const user = await userRepository.findById(session.userId);

    return (
        <DashboardLayoutWithProviders showFirstLoginShowcase={Boolean(user?.firstLogin)}>
            {children}
        </DashboardLayoutWithProviders>
    );
}


