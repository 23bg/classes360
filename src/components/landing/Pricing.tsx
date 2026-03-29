"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { PlanType } from "@/config/plans";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { Info } from "lucide-react";
import ComparisonDialog from "@/components/landing/pricing/ComparisonDialog";
import PlanCard from "@/components/landing/pricing/PlanCard";
import StrategicComparisonSection from "@/components/landing/pricing/StrategicComparisonSection";
import { featureGroups, planDefinitions } from "@/components/landing/pricing/pricing-data";

export default function Pricing() {
    const t = useTranslations("pricing");

    const [yearlyBilling, setYearlyBilling] = useState(false);
    const [comparisonOpen, setComparisonOpen] = useState(false);
    const [activePlan, setActivePlan] = useState<PlanType | null>(null);

    const billingSuffix = yearlyBilling
        ? t("yearlyPriceSuffix")
        : t("monthlyPriceSuffix");

    return (
        <section id="pricing" className="border-b bg-muted/40">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">

                {/* HEADER */}

                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <h2 className="text-4xl font-semibold">{t("title")}</h2>
                    <p className="text-muted-foreground">{t("description")}</p>
                    <p className="text-sm font-medium text-foreground">
                        {t("positioningLine")}
                    </p>
                </div>

                <div className="mt-10 text-center text-sm text-muted-foreground">
                    {t("coreSystemLine")}
                </div>

                <div className="mt-2 text-center text-sm text-muted-foreground">
                    {t("whatsAppSenderModesLine")}
                </div>

                {/* BILLING TOGGLE */}

                <div className="mt-8 flex items-center justify-center gap-3">
                    <span className={`text-sm ${!yearlyBilling ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {t("monthlyToggle")}
                    </span>

                    <Switch checked={yearlyBilling} onCheckedChange={setYearlyBilling} />

                    <span className={`text-sm ${yearlyBilling ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {t("yearlyToggle")}
                    </span>

                    <Badge variant="secondary">{t("yearlyBadge")}</Badge>
                </div>

                <p className="mt-3 text-center text-sm text-muted-foreground">
                    {t("yearlyFreeLine")}
                </p>

                <p className="mt-6 rounded-md border bg-primary/5 px-4 py-3 text-center text-sm font-medium text-foreground">
                    {t("trialBadge")}
                </p>

                <div className="mt-8 rounded-xl border border-primary/30 bg-primary/10 p-6 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">ROI</p>
                    <h3 className="mt-2 text-xl font-semibold">1 admission covers your monthly cost</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Most institutes recover the subscription with one additional conversion.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2">
                        <FeatureTooltip text="ROI varies by course fee and institute conversion cycle." />
                    </div>
                </div>

                {/* PRICING CARDS */}

                <div className="mt-12 grid gap-6 xl:grid-cols-4">
                    {planDefinitions.map((plan) => (
                        <PlanCard
                            key={plan.key}
                            plan={plan}
                            yearlyBilling={yearlyBilling}
                            billingSuffix={billingSuffix}
                            featureGroups={featureGroups}
                            onCompareClick={(planType) => {
                                setActivePlan(planType);
                                setComparisonOpen(true);
                            }}
                        />
                    ))}
                </div>

                <StrategicComparisonSection />

                <ComparisonDialog
                    open={comparisonOpen}
                    onOpenChange={setComparisonOpen}
                    activePlan={activePlan}
                    featureGroups={featureGroups}
                />

            </div>
        </section>
    );
}

function FeatureTooltip({ text }: { text: string }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                </TooltipTrigger>

                <TooltipContent className="max-w-xs text-sm">
                    {text}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}