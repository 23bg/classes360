"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2 } from "lucide-react";
import PlanCard from "@/components/landing/pricing/PlanCard";
import CustomPricingCard from "@/components/landing/pricing/CustomPricingCard";
import PricingComparisonTable from "@/components/landing/pricing/PricingComparisonTable";
import { planDefinitions } from "@/components/landing/pricing/pricing-data";

export default function Pricing() {
    const t = useTranslations("pricing");

    const [yearlyBilling, setYearlyBilling] = useState(false);

    const billingSuffix = yearlyBilling
        ? t("yearlyPriceSuffix")
        : t("monthlyPriceSuffix");

    const valueStripItems = [
        t("valueStrip.unlimitedEnquiries"),
        t("valueStrip.unlimitedStudents"),
        t("valueStrip.unlimitedCourses"),
        t("valueStrip.unlimitedBatches"),
        t("valueStrip.fullSupportIncluded"),
    ];

    const trustStripItems = [
        t("trustStrip.item1"),
        t("trustStrip.item2"),
        t("trustStrip.item3"),
        t("trustStrip.item4"),
    ];

    const footerTrustItems = [
        t("footerTrust.item1"),
        t("footerTrust.item2"),
        t("footerTrust.item3"),
        t("footerTrust.item4"),
    ];

    return (
        <section id="pricing" className="bg-muted/40 rounded-xl border-border">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
                <div className="mb-8 rounded-xl border bg-background p-3 md:p-4">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {trustStripItems.map((item) => (
                            <div key={item} className="rounded-md bg-muted/40 px-3 py-2 text-center text-sm font-medium text-foreground">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* HEADER */}

                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <h2 className="text-4xl font-semibold">{t("header.headline")}</h2>
                    <p className="text-muted-foreground">{t("header.subtext")}</p>
                    <p className="text-sm font-medium text-foreground">
                        {t("header.trustLine")}
                    </p>
                </div>

                <div className="mt-8 rounded-xl border bg-background p-4 md:p-5">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {valueStripItems.map((item) => (
                            <div key={item} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                                <span className="font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
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

                {/* PRICING CARDS */}

                <div className="mt-12 grid gap-6 lg:grid-cols-3">
                    {planDefinitions.slice(0, 3).map((plan) => (
                        <PlanCard
                            key={plan.key}
                            plan={plan}
                            yearlyBilling={yearlyBilling}
                            billingSuffix={billingSuffix}
                        />
                    ))}
                </div>

                {/* Custom pricing calculator card below the main plans */}
                <div className="mt-6">
                    <CustomPricingCard />
                </div>

                <PricingComparisonTable />

                <section className="mt-14 space-y-3">
                    <h3 className="text-center text-2xl font-semibold">{t("footerTrust.title")}</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {footerTrustItems.map((item) => (
                            <div key={item} className="rounded-lg border bg-background p-4 text-sm font-medium">
                                {item}
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </section>
    );
}