import { Fragment } from "react";
import { Check, X } from "lucide-react";

import type { PlanType } from "@/config/plans";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import type { FeatureGroupDefinition } from "./pricing-data";
import { planFeatureMatrix } from "./pricing-data";

type ComparisonDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activePlan: PlanType | null;
    featureGroups: FeatureGroupDefinition[];
};

const planOrder: PlanType[] = ["STARTER", "TEAM", "GROWTH", "SCALE"];

const planDisplayNames: Record<PlanType, string> = {
    STARTER: "Starter",
    TEAM: "Team",
    GROWTH: "Growth",
    SCALE: "Scale",
};

export default function ComparisonDialog({
    open,
    onOpenChange,
    activePlan,
    featureGroups,
}: ComparisonDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Compare plans</DialogTitle>
                    <DialogDescription>
                        {activePlan
                            ? `${planDisplayNames[activePlan]} selected. Review all plans feature-by-feature.`
                            : "Review all plans feature-by-feature."}
                    </DialogDescription>
                </DialogHeader>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-52">Feature</TableHead>
                            {planOrder.map((plan) => (
                                <TableHead key={plan} className="text-center">
                                    {planDisplayNames[plan]}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {featureGroups.map((group) => (
                            <Fragment key={group.id}>
                                <TableRow className="bg-muted/40">
                                    <TableCell className="font-semibold">{group.title}</TableCell>
                                    <TableCell />
                                    <TableCell />
                                    <TableCell />
                                    <TableCell />
                                </TableRow>
                                {group.features.map((feature) => (
                                    <TableRow key={feature.id}>
                                        <TableCell className="text-muted-foreground">{feature.label}</TableCell>
                                        {planOrder.map((plan) => {
                                            const availability = planFeatureMatrix[plan][feature.id];

                                            return (
                                                <TableCell key={`${feature.id}-${plan}`} className="text-center">
                                                    {availability.included ? (
                                                        availability.value ? (
                                                            <span className="font-medium">{availability.value}</span>
                                                        ) : (
                                                            <Check className="mx-auto h-4 w-4" aria-label="Included" />
                                                        )
                                                    ) : (
                                                        <X
                                                            className="mx-auto h-4 w-4 text-muted-foreground"
                                                            aria-label="Not included"
                                                        />
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </Fragment>
                        ))}
                    </TableBody>
                </Table>

                <DialogFooter showCloseButton />
            </DialogContent>
        </Dialog>
    );
}
