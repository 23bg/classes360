// "use client";

// import { useState, useEffect } from "react";
// import { type LucideIcon, ChevronDown } from "lucide-react";
// import Link from "next/link";

// import {
//     SidebarGroup,
//     SidebarGroupLabel,
//     SidebarMenu,
//     SidebarMenuButton,
//     SidebarMenuItem,
// } from "@/components/ui/sidebar";

// export function NavMain({
//     menuTitle,
//     items,
// }: {
//     menuTitle?: string;
//     items: {
//         title: string;
//         url: string;
//         icon?: LucideIcon;
//         isActive?: boolean;
//         children?: {
//             title: string;
//             url: string;
//             isActive?: boolean;
//         }[];
//     }[];
// }) {
//     const toStepId = (title: string) =>
//         `dashboard-nav-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

//     return (
//         <SidebarGroup>
//             {menuTitle ? <SidebarGroupLabel>{menuTitle}</SidebarGroupLabel> : null}

//             <SidebarMenu>
//                 {items.map((item) => {
//                     const hasChildren = item.children && item.children.length > 0;

//                     // auto open if any child active
//                     const defaultOpen =
//                         item.isActive ||
//                         item.children?.some((c) => c.isActive);

//                     const [open, setOpen] = useState(defaultOpen);

//                     useEffect(() => {
//                         if (defaultOpen) setOpen(true);
//                     }, [defaultOpen]);

//                     return (
//                         <SidebarMenuItem key={item.title}>
//                             <div className="flex flex-col">
//                                 <SidebarMenuButton
//                                     tooltip={item.title}
//                                     onClick={() => {
//                                         if (hasChildren) {
//                                             setOpen((prev) => !prev);
//                                         }
//                                     }}
//                                 >
//                                     <div className="flex items-center justify-between w-full">
//                                         <Link
//                                             id={toStepId(item.title)}
//                                             href={item.url}
//                                             className="flex items-center gap-2 flex-1"
//                                         >
//                                             {item.icon ? (
//                                                 <item.icon className="h-4 w-4 shrink-0" />
//                                             ) : null}
//                                             <span>{item.title}</span>
//                                         </Link>

//                                         {hasChildren && (
//                                             <ChevronDown
//                                                 className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""
//                                                     }`}
//                                             />
//                                         )}
//                                     </div>
//                                 </SidebarMenuButton>

//                                 {/* Dropdown */}
//                                 {hasChildren && open && (
//                                     <div className="ml-6 mt-1 space-y-1">
//                                         {item.children!.map((child) => (
//                                             <SidebarMenuButton
//                                                 key={`${item.title}-${child.title}`}
//                                                 asChild
//                                                 tooltip={child.title}
//                                             >
//                                                 <Link
//                                                     id={toStepId(`${item.title}-${child.title}`)}
//                                                     href={child.url}
//                                                     className="text-xs text-muted-foreground"
//                                                 >
//                                                     {child.title}
//                                                 </Link>
//                                             </SidebarMenuButton>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         </SidebarMenuItem>
//                     );
//                 })}
//             </SidebarMenu>
//         </SidebarGroup>
//     );
// }

"use client";

import { useState, useEffect } from "react";
import { type LucideIcon, ChevronDown } from "lucide-react";
import Link from "next/link";

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
    menuTitle,
    items,
}: {
    menuTitle?: string;
    items: {
        title: string;
        url: string;
        icon?: LucideIcon;
        isActive?: boolean;
        children?: {
            title: string;
            url: string;
            isActive?: boolean;
        }[];
    }[];
}) {
    const toStepId = (title: string) =>
        `dashboard-nav-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

    return (
        <SidebarGroup>
            {menuTitle && <SidebarGroupLabel>{menuTitle}</SidebarGroupLabel>}

            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = !!item.children?.length;

                    const defaultOpen =
                        item.children?.some((c) => c.isActive) || false;

                    const [open, setOpen] = useState(defaultOpen);

                    useEffect(() => {
                        if (defaultOpen) setOpen(true);
                    }, [defaultOpen]);

                    return (
                        <SidebarMenuItem key={item.title}>
                            {/* 🔹 CASE 1: NORMAL MENU (NO DROPDOWN) */}
                            {!hasChildren && (
                                <SidebarMenuButton asChild tooltip={item.title}>
                                    <Link
                                        id={toStepId(item.title)}
                                        href={item.url}
                                        className="flex items-center gap-2"
                                    >
                                        {item.icon && (
                                            <item.icon className="h-4 w-4 shrink-0" />
                                        )}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}

                            {/* 🔹 CASE 2: DROPDOWN MENU ONLY */}
                            {hasChildren && (
                                <div className="flex flex-col">
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        onClick={() =>
                                            setOpen((prev) => !prev)
                                        }
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                {item.icon && (
                                                    <item.icon className="h-4 w-4 shrink-0" />
                                                )}
                                                <span>{item.title}</span>
                                            </div>

                                            <ChevronDown
                                                className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </div>
                                    </SidebarMenuButton>

                                    {/* Dropdown content */}
                                    <div
                                        className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-200 ${open ? "max-h-40" : "max-h-0"
                                            }`}
                                    >
                                        {item.children!.map((child) => (
                                            <SidebarMenuButton
                                                key={`${item.title}-${child.title}`}
                                                asChild
                                                tooltip={child.title}
                                            >
                                                <Link
                                                    id={toStepId(
                                                        `${item.title}-${child.title}`
                                                    )}
                                                    href={child.url}
                                                    className="text-xs text-muted-foreground"
                                                >
                                                    {child.title}
                                                </Link>
                                            </SidebarMenuButton>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}