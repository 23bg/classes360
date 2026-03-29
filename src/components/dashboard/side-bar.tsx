"use client"

import {
    Home,
    Building2,
    Users,
    BookOpen,
    Layers,
    IndianRupee,
    UserRound,
    Wallet,
    MessageCircle,
    Twitter,
    Linkedin,
    Users2,
    UsersIcon,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
    SidebarFooter,
} from "@/components/ui/sidebar"

import Link from "next/link"
import ROUTES from "@/constants/routes"
import { NavMain } from "@/components/dashboard/nav-main"
import { usePathname } from "next/navigation"

export function DashboardAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const pathname = usePathname();
    const { state } = useSidebar();

    const withActiveFlag = (items: any[]) =>
        items.map((item) => {
            const isRoot = item.url === "/";

            return {
                ...item,
                isActive: isRoot
                    ? pathname === "/"
                    : pathname === item.url || pathname.startsWith(item.url + "/"),
            };
        });

    const navSections = [
        {
            title: "Overview",
            items: [
                {
                    title: "Dashboard",
                    url: ROUTES.DASHBOARD.ROOT,
                    icon: Home,
                },
            ],
        },
        {
            title: "Menus",
            items: [
                {
                    title: "Leads",
                    url: ROUTES.DASHBOARD.LEADS,
                    icon: UserRound,
                },
                {
                    title: "Students",
                    url: ROUTES.DASHBOARD.STUDENTS,
                    icon: UsersIcon,
                },

                {
                    title: "Courses",
                    url: ROUTES.DASHBOARD.COURSES,
                    icon: BookOpen,

                },


                {
                    title: "Fees",
                    url: ROUTES.DASHBOARD.FEES,
                    icon: IndianRupee,
                },

                // {
                //     title: "Institute",
                //     url: ROUTES.DASHBOARD.INSTITUTE,
                //     icon: Building2,
                // },
                {
                    title: "Team",
                    url: ROUTES.DASHBOARD.TEAM,
                    icon: Users2,
                },

                {
                    title: "Billing",
                    // url: ROUTES.DASHBOARD.BILLING,
                    icon: Wallet,
                    children: [
                        // {
                        //     title: "Billing Overview",
                        //     url: ROUTES.DASHBOARD.BILLING,
                        // },
                        {
                            title: "Payments",
                            url: ROUTES.DASHBOARD.BILLING_PAYMENTS,
                        },
                        {
                            title: "Payment Details",
                            url: ROUTES.DASHBOARD.BILLING_PAYMENT_DETAILS,
                        },
                        {
                            title: "Plans",
                            url: ROUTES.DASHBOARD.BILLING_PLANS,
                        },
                    ],
                },
            ],
        },
    ];

    return (
        <Sidebar collapsible='offcanvas' {...props} variant="inset" className="h-screen overflow-hidden " >
            <SidebarHeader className="mx-0 px-0 ">
                <SidebarGroup >
                    <SidebarMenu >
                        <SidebarMenuItem  >
                            <SidebarMenuButton variant='default' className="h-10 hover:bg-transparent target:bg-transparent open:bg-transparent" isActive={false} >
                                <Link id="dashboard-brand" href={ROUTES.DASHBOARD.ROOT} >




                                    <p className="text-xl font-semibold text-primary">Classes360</p>
                                    <p className="text-xs text-muted-foreground hover:text-muted-foreground">Manage your institute</p>



                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent >
                {navSections.map((section) => (
                    <NavMain
                        key={section.title ?? "primary"}
                        menuTitle={section.title}

                        items={withActiveFlag(section.items)}
                    />
                ))}
            </SidebarContent>
            <SidebarFooter >
                <div className="flex flex-col gap-2 p-3">

                    <Link
                        href={process.env.NEXT_PUBLIC_WHATSAPP || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">WhatsApp</span>
                    </Link>

                    <Link
                        href={process.env.NEXT_PUBLIC_X || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="X"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
                    >
                        <Twitter className="h-4 w-4" />
                        <span className="text-sm">X</span>
                    </Link>

                    <Link
                        href={process.env.NEXT_PUBLIC_LINKEDIN || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
                    >
                        <Linkedin className="h-4 w-4" />
                        <span className="text-sm">LinkedIn</span>
                    </Link>

                </div>
            </SidebarFooter>


        </Sidebar>
    );
}

