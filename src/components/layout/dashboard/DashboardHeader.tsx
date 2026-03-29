"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import ImraboChat from "@/modules/ai/components/ImraboChat";
import UserMenu from "@/modules/auth/components/UserMenu";
import GlobalSearch from "@/components/layout/dashboard/GlobalSearch";
import ROUTES from "@/constants/routes";
import { Bell, Building2, CircleHelp } from "lucide-react";


import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const routeLabelMap: Record<string, string> = {
    dashboard: "Dashboard",
    leads: "Leads",
    students: "Students",
    team: "Team",
    courses: "Courses",
    batches: "Batches",
    fees: "Fees",
    payments: "Payments",
    institute: "Institute",
    settings: "Settings",
    billing: "Billing",
    profile: "Profile",
};

const toTitleCase = (value: string) =>
    value
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

export default function DashboardHeader() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);

    const crumbs = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const label = routeLabelMap[segment] ?? toTitleCase(segment);
        return { href, label };
    });

    return (
        <header id="dashboard-header" className="flex h-16 items-center justify-between px-4 border-b bg-background dark:bg-zinc-900/40 backdrop-blur-sm rounded-t-2xl">
            <div className="flex items-center gap-3 min-w-0">
                <SidebarTrigger />

                <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground truncate">
                    <Link href={ROUTES.DASHBOARD.ROOT} className="hover:text-foreground transition-colors">
                        Dashboard
                    </Link>

                    {crumbs
                        .filter((crumb) => crumb.href !== ROUTES.DASHBOARD.ROOT)
                        .map((crumb, index, arr) => {
                            const isLast = index === arr.length - 1;
                            return (
                                <span key={crumb.href} className="flex items-center gap-2 min-w-0">
                                    <span>/</span>
                                    {isLast ? (
                                        <span className="text-foreground truncate">{crumb.label}</span>
                                    ) : (
                                        <Link href={crumb.href} className="hover:text-foreground transition-colors truncate">
                                            {crumb.label}
                                        </Link>
                                    )}
                                </span>
                            );
                        })}
                </nav>
            </div>

            <div className="flex items-center gap-3">
                <GlobalSearch />
                <ImraboChat />
                <Button asChild variant="outline" size="icon" aria-label="Notifications">
                    <Link href={ROUTES.DASHBOARD.INSTITUTE}>
                        <Building2 className="h-4 w-4" />
                    </Link>
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
                            <Bell className="h-4 w-4" />

                            {/* unread badge */}
                            <span className="absolute -top-1 -right-1">
                                <Badge variant="destructive" className="h-4 w-4 p-0 text-[10px] flex items-center justify-center">
                                    3
                                </Badge>
                            </span>
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent align="end" className="w-80 p-0">
                        <div className="flex items-center justify-between px-4 py-2 border-b">
                            <span className="text-sm font-medium">Notifications</span>
                            <button className="text-xs text-muted-foreground hover:text-foreground">
                                Mark all read
                            </button>
                        </div>

                        <ScrollArea className="h-80">
                            <div className="flex flex-col">
                                {/* Example Notification */}
                                <div className="px-4 py-3 border-b hover:bg-muted/50 cursor-pointer">
                                    <p className="text-sm font-medium">New student registered</p>
                                    <p className="text-xs text-muted-foreground">2 min ago</p>
                                </div>

                                <div className="px-4 py-3 border-b hover:bg-muted/50 cursor-pointer">
                                    <p className="text-sm font-medium">Payment received</p>
                                    <p className="text-xs text-muted-foreground">10 min ago</p>
                                </div>

                                <div className="px-4 py-3 border-b hover:bg-muted/50 cursor-pointer">
                                    <p className="text-sm font-medium">Batch updated</p>
                                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                                </div>
                            </div>
                        </ScrollArea>

                        {/* <div className="p-2 border-t text-center">
                            <Link
                                href="/settings/notifications"
                                className="text-xs text-primary hover:underline"
                            >
                                View all notifications
                            </Link>
                        </div> */}
                    </PopoverContent>
                </Popover>

                <UserMenu />
                {/* <Button asChild variant="ghost" size="icon" aria-label="Help Center">
                    <Link href={ROUTES.HELP}>
                        <CircleHelp className="h-4 w-4" />
                    </Link>
                </Button> */}
            </div>
        </header>
    );
}
