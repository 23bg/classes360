import AuthLayout from '@/components/layout/AuthLayout'
import type { Metadata } from "next";
import React from 'react'
import { ReduxProvider } from "@/providers/ReduxProvider";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default async function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ReduxProvider>
            <AuthLayout>{children}</AuthLayout>
        </ReduxProvider>
    );
}


