import type React from "react";
import LandingHeader from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <LandingHeader />
            <main className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-12 md:px-6 lg:py-16">
                <div className="w-full max-w-md">{children}</div>
            </main>
            <Footer />
        </div>
    );
}

