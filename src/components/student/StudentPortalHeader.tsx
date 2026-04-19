"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStudentPortal, useStudentPortalLogout } from "@/features/studentPortal/api";

const navItems = [
    { label: "Dashboard", href: "/student" },
    { label: "Course", href: "/student/course" },
    { label: "Announcements", href: "/student/announcements" },
    { label: "Institute", href: "/student/institute" },
    { label: "Profile", href: "/student/profile" },
];

const getInitials = (value: string) =>
    value
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "IN";

export default function StudentPortalHeader() {
    const pathname = usePathname();
    const { data } = useStudentPortal();
    const logoutMutation = useStudentPortalLogout();
    const authLoading = logoutMutation.isPending;

    const instituteName = data?.student?.institute?.name?.trim() || "Institute";
    const instituteLogo = data?.student?.institute?.logo || data?.student?.institute?.logoUrl || "";
    const studentName = data?.student?.name?.trim() || "Student";

    const instituteInitials = useMemo(() => getInitials(instituteName), [instituteName]);
    const studentInitials = useMemo(() => getInitials(studentName), [studentName]);

    const logout = async () => {
        try {
            await logoutMutation.mutateAsync();
        } finally {
            window.location.href = "/student-login";
        }
    };

    return (
        <header className="bg-background">
            <div className="mx-auto max-w-6xl px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        {instituteLogo ? (
                            <Image
                                src={instituteLogo}
                                alt={`${instituteName} logo`}
                                width={160}
                                height={36}
                                unoptimized
                                className="h-9 w-auto max-w-40 object-contain"
                            />
                        ) : (
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{instituteInitials}</AvatarFallback>
                            </Avatar>
                        )}
                        <h2 className="truncate text-base font-semibold">{instituteName}</h2>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button aria-label="Open student menu" className="rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src="" alt={studentName} />
                                    <AvatarFallback>{studentInitials}</AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={logout}>{authLoading ? "Logging out..." : "Logout"}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <nav className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                    {navItems.map((item) => {
                        const active =
                            item.href === "/student"
                                ? pathname === "/student"
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
