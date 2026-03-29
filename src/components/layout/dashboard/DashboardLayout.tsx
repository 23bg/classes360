"use client";

import Link from "next/link";
import { Linkedin, MessageCircle, Twitter } from "lucide-react";
import dynamic from "next/dynamic";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";

const DashboardAppSidebar = dynamic(
    () => import("@/components/dashboard/side-bar").then((mod) => mod.DashboardAppSidebar)
);
const DashboardShowcaseTour = dynamic(
    () => import("@/components/dashboard/DashboardShowcaseTour")
);

export default function DashboardLayout({
    children,
    showFirstLoginShowcase = false,
}: {
    children: React.ReactNode;
    showFirstLoginShowcase?: boolean;
}) {
    return (
        <DashboardShowcaseTour enabled={showFirstLoginShowcase}>
            <SidebarProvider className=" overflow-hidden h-screen">
                <DashboardAppSidebar />

                <SidebarInset className="border-none shadow-none bg-muted/30 backdrop-blur-sm rounded-2xl">
                    <DashboardHeader />

                    {/* MAIN CONTENT */}
                    <main className="overflow-hidden">
                        <div className="h-screen">
                            <ScrollArea className="h-full">
                                {children}
                                <div className="h-30"></div>
                            </ScrollArea>
                        </div>
                    </main>

                    {/* FOOTER */}
                    <footer
                        className="
  border-t bg-background dark:bg-zinc-900/40
  backdrop-blur-sm rounded-b-2xl
"
                    >
                        <div
                            className="
    flex flex-col sm:flex-row justify-between items-center
    gap-2 px-6 py-3 text-xs text-muted-foreground
  "
                        >
                            {/* COPYRIGHT */}
                            <span>© 2026 Classes360. Built for coaching institutes.</span>

                            {/* LINKS */}
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/help"
                                    className="hover:text-foreground transition"
                                >
                                    Help
                                </Link>



                                <Link
                                    href="/contact"
                                    className="hover:text-foreground transition"
                                >
                                    Contact
                                </Link>



                                <Link
                                    href="/about"
                                    className="hover:text-foreground transition"
                                >
                                    About
                                </Link>
                            </div>
                        </div>
                    </footer>


                </SidebarInset>
            </SidebarProvider>
        </DashboardShowcaseTour>
    );
}

