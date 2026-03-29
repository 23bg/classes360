"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ListWidgetProps = {
    title: string;
    description?: string;
    search?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    actions?: React.ReactNode;
    loading?: boolean;
    isEmpty?: boolean;
    emptyMessage?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    contentClassName?: string;
};

export default function ListWidget({
    title,
    description,
    search,
    onSearchChange,
    searchPlaceholder = "Search...",
    actions,
    loading = false,
    isEmpty = false,
    emptyMessage = "No data found.",
    children,
    footer,
    className,
    contentClassName,
}: ListWidgetProps) {
    return (
        <main className={cn("p-6 space-y-4", className)}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    {description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {onSearchChange ? (
                        <Input
                            value={search}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full md:w-72"
                        />
                    ) : null}
                    {actions}
                </div>
            </div>

            <div className={cn("rounded-lg border bg-background", contentClassName)}>
                {loading ? (
                    <div className="flex min-h-40 items-center justify-center px-6 py-12 text-sm text-muted-foreground">
                        Loading data...
                    </div>
                ) : isEmpty ? (
                    <div className="flex min-h-40 items-center justify-center px-6 py-12 text-sm text-muted-foreground">
                        {emptyMessage}
                    </div>
                ) : (
                    children
                )}
            </div>

            {footer ? <div className="flex items-center justify-end">{footer}</div> : null}
        </main>
    );
}
