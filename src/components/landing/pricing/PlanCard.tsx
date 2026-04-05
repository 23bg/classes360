import Link from "next/link";

import type { PlanType } from "@/config/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import FeatureGroup from "./FeatureGroup";
import FeatureItem from "./FeatureItem";
import type { FeatureGroupDefinition, PlanDefinition } from "./pricing-data";
import { formatPlanPrice, planFeatureMatrix } from "./pricing-data";

type PlanCardProps = {
    plan: PlanDefinition;
    yearlyBilling: boolean;
    billingSuffix: string;
    featureGroups: FeatureGroupDefinition[];
    onCompareClick: (planType: PlanType) => void;
};

export default function PlanCard({
    plan,
    yearlyBilling,
    billingSuffix,
    featureGroups,
    onCompareClick,
}: PlanCardProps) {
    return (
        <Card
            className={plan.highlight ? "rounded-lg border-2 border-primary shadow-lg" : "rounded-lg border"}
        >
            <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-4xl font-semibold">
                        INR {formatPlanPrice(plan.key, yearlyBilling)}
                    </CardTitle>
                    {plan.highlight ? <Badge>Most Popular</Badge> : null}
                </div>

                <p className="text-sm text-muted-foreground">{billingSuffix}</p>

                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {featureGroups.map((group) => (
                    <FeatureGroup key={group.id} title={group.title}>
                        {group.features.map((feature) => {
                            const availability = planFeatureMatrix[plan.key][feature.id];

                            return (
                                <FeatureItem
                                    key={feature.id}
                                    label={feature.label}
                                    included={availability.included}
                                    value={availability.value}
                                />
                            );
                        })}
                    </FeatureGroup>
                ))}
            </CardContent>

            <CardFooter className="grid gap-2">
                <Button asChild className="h-11 w-full">
                    <Link href={plan.link}>{plan.cta}</Link>
                </Button>
                <Button
                    variant="outline"
                    className="h-10 w-full"
                    onClick={() => onCompareClick(plan.key)}
                >
                    Compare plans
                </Button>
            </CardFooter>
        </Card>
    );
}
