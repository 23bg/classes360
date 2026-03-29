"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "@/constants/navigation";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function LandingHeader() {
    const tNavbar = useTranslations("navbar");
    const tCommon = useTranslations("common");

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-base font-bold tracking-tight">
                        {tNavbar("brand")}
                    </Link>

                    <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
                        {PUBLIC_NAV_ITEMS.map((item) => (
                            <Link key={item.href} href={item.href} className="hover:text-foreground transition-colors">
                                {tNavbar(item.labelKey)}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden" aria-label={tNavbar("openMenu")}>
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[85%] sm:max-w-sm">
                            <SheetHeader className="border-b">
                                <SheetTitle>{tNavbar("menu")}</SheetTitle>
                            </SheetHeader>
                            <nav className="grid gap-1 px-4 py-3">
                                {PUBLIC_NAV_ITEMS.map((item) => (
                                    <SheetClose key={item.href} asChild>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            {tNavbar(item.labelKey)}
                                        </Link>
                                    </SheetClose>
                                ))}
                            </nav>
                            <div className="mt-auto grid gap-2 border-t p-4">
                                <SheetClose asChild>
                                    <Button asChild variant="ghost" size="sm" className="justify-start">
                                        <Link href={ROUTES.AUTH.LOG_IN}>{tCommon("login")}</Link>
                                    </Button>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button asChild size="sm" className="justify-start">
                                        <Link href={ROUTES.AUTH.SIGN_UP}>{tCommon("startFreeTrial")}</Link>
                                    </Button>
                                </SheetClose>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                        <Link href={ROUTES.AUTH.LOG_IN}>{tCommon("login")}</Link>
                    </Button>
                    <Button asChild size="sm" className="hidden md:inline-flex">
                        <Link href={ROUTES.AUTH.SIGN_UP}>{tCommon("startFreeTrial")}</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}