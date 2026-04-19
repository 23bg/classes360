"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, PlusCircle, UserPlus, HandCoins, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import ROUTES from "@/constants/routes";
import { useGlobalSearchQuery } from "@/features/globalSearch/hooks/useGlobalSearchQuery";
import type { SearchResults } from "@/features/globalSearch/globalSearchApi";

const EMPTY_RESULTS: SearchResults = {
    leads: [],
    students: [],
    courses: [],
};

export default function GlobalSearch() {
    const t = useTranslations("common");
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { data: results = EMPTY_RESULTS, isFetching: loading } = useGlobalSearchQuery(debouncedQuery, open && debouncedQuery.length >= 2);

    const hasAnyResult = useMemo(
        () => results.leads.length > 0 || results.students.length > 0 || results.courses.length > 0,
        [results]
    );

    useEffect(() => {
        setMounted(true);

        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    useEffect(() => {
        if (!open || query.trim().length < 2) {
            setDebouncedQuery("");
            return;
        }

        const timer = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 250);

        return () => clearTimeout(timer);
    }, [open, query]);

    const visibleResults = query.trim().length >= 2 ? results : EMPTY_RESULTS;

    const navigateTo = (href: string) => {
        setOpen(false);
        router.push(href);
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                className="hidden md:flex h-9 w-48 items-center justify-between px-3 text-muted-foreground"
                onClick={() => setOpen(true)}
            >
                <div className="flex items-center justify-center gap-3">
                    <Search className="h-4 w-4" />
                    <span>{t("searchPlaceholder")}</span>
                </div>
            </Button>

            {mounted && (
                <CommandDialog
                    open={open}
                    onOpenChange={(nextOpen) => {
                        setOpen(nextOpen);
                        if (!nextOpen) {
                            setQuery("");
                        }
                    }}
                    title={t("globalSearchTitle")}
                    description={t("globalSearchDescription")}
                >
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder={t("searchPlaceholder")}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {loading ? t("searching") : t("noResultsFound")}
                        </CommandEmpty>

                        <CommandGroup heading={t("pagesHeading")}>
                            <CommandItem onSelect={() => navigateTo(ROUTES.DASHBOARD.ROOT)}>{t("dashboard")}</CommandItem>
                            <CommandItem onSelect={() => navigateTo(ROUTES.DASHBOARD.LEADS)}>{t("leads")}</CommandItem>
                            <CommandItem onSelect={() => navigateTo(ROUTES.DASHBOARD.STUDENTS)}>{t("students")}</CommandItem>
                            <CommandItem onSelect={() => navigateTo(ROUTES.DASHBOARD.COURSES)}>{t("courses")}</CommandItem>
                            <CommandItem onSelect={() => navigateTo(ROUTES.DASHBOARD.BATCHES)}>{t("batches")}</CommandItem>
                            <CommandItem onSelect={() => navigateTo(ROUTES.DASHBOARD.FEES)}>{t("fees")}</CommandItem>
                            <CommandItem onSelect={() => navigateTo(ROUTES.DASHBOARD.BILLING)}>{t("billing")}</CommandItem>
                            <CommandItem onSelect={() => navigateTo(ROUTES.DASHBOARD.BILLING_PAYMENTS)}>{t("payments")}</CommandItem>
                            <CommandItem onSelect={() => navigateTo(ROUTES.DASHBOARD.INTEGRATIONS)}>{t("integrations")}</CommandItem>
                        </CommandGroup>

                        <CommandSeparator />

                        <CommandGroup heading={t("quickActionsHeading")}> 
                            <CommandItem onSelect={() => navigateTo(`${ROUTES.DASHBOARD.LEADS}?focus=recent`)}>
                                <PlusCircle className="h-4 w-4" />
                                {t("addLead")}
                            </CommandItem>
                            <CommandItem onSelect={() => navigateTo(`${ROUTES.DASHBOARD.STUDENTS}?action=add`)}>
                                <UserPlus className="h-4 w-4" />
                                {t("addStudent")}
                            </CommandItem>
                            <CommandItem onSelect={() => navigateTo(ROUTES.DASHBOARD.FEES)}>
                                <HandCoins className="h-4 w-4" />
                                {t("recordPayment")}
                            </CommandItem>
                            <CommandItem onSelect={() => navigateTo(ROUTES.DASHBOARD.BATCHES)}>
                                <Layers className="h-4 w-4" />
                                {t("createBatch")}
                            </CommandItem>
                        </CommandGroup>

                        {query.trim().length >= 2 ? (
                            <>
                                <CommandSeparator />
                                <CommandGroup heading={t("leadsHeading")}>
                                    {visibleResults.leads.map((lead) => (
                                        <CommandItem
                                            key={`lead-${lead.id}`}
                                            onSelect={() => navigateTo(`${ROUTES.DASHBOARD.LEADS}?query=${encodeURIComponent(lead.phone || lead.name)}`)}
                                        >
                                            <div className="flex w-full items-center justify-between gap-2">
                                                <span>{lead.name}</span>
                                                <span className="text-xs text-muted-foreground">{lead.status}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>

                                <CommandGroup heading={t("studentsHeading")}>
                                    {visibleResults.students.map((student) => (
                                        <CommandItem
                                            key={`student-${student.id}`}
                                            onSelect={() => navigateTo(`${ROUTES.DASHBOARD.STUDENTS}?query=${encodeURIComponent(student.phone || student.name)}`)}
                                        >
                                            <div className="flex w-full items-center justify-between gap-2">
                                                <span>{student.name}</span>
                                                <span className="text-xs text-muted-foreground">{student.phone}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>

                                <CommandGroup heading={t("coursesHeading")}>
                                    {visibleResults.courses.map((course) => (
                                        <CommandItem
                                            key={`course-${course.id}`}
                                            onSelect={() => navigateTo(`${ROUTES.DASHBOARD.COURSES}?query=${encodeURIComponent(course.name)}`)}
                                        >
                                            <div className="flex w-full items-center justify-between gap-2">
                                                <span>{course.name}</span>
                                                <span className="text-xs text-muted-foreground">{course.duration || t("durationNotSet")}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        ) : null}

                        <CommandSeparator />
                        <CommandGroup heading={t("helpHeading")}> 
                            <CommandItem onSelect={() => navigateTo(ROUTES.HELP)}>{t("openHelpCenter")}</CommandItem>
                        </CommandGroup>
                    </CommandList>
                </CommandDialog>
            )}
        </>
    );
}
