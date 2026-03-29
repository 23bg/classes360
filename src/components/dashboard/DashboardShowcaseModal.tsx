"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type DashboardShowcaseModalProps = {
    openByDefault: boolean;
};

const steps = [
    {
        title: "Welcome to Classes360",
        description: "Manage admissions easily",
    },
    {
        title: "Add Courses",
        description: "Track Students and Manage Leads",
    },
    {
        title: "Public Institute Page",
        description: "Share your link",
    },
    {
        title: "Start Using Dashboard",
        description: "You are all set",
    },
];

export default function DashboardShowcaseModal({ openByDefault }: DashboardShowcaseModalProps) {
    const [open, setOpen] = useState(openByDefault);
    const [stepIndex, setStepIndex] = useState(0);
    const isLastStep = stepIndex === steps.length - 1;

    const step = useMemo(() => steps[stepIndex], [stepIndex]);

    const completeShowcase = async () => {
        await fetch("/api/v1/dashboard/showcase/complete", { method: "POST" });
        setOpen(false);
    };

    const goNext = async () => {
        if (isLastStep) {
            await completeShowcase();
            return;
        }

        setStepIndex((prev) => prev + 1);
    };

    const skip = async () => {
        await completeShowcase();
    };

    return (
        <Dialog open={open} onOpenChange={() => undefined}>
            <DialogContent showCloseButton={false} className="h-screen w-screen max-w-none rounded-none border-0 p-0">
                <div className="flex h-full flex-col items-center justify-center gap-10 bg-background px-6 text-center">
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Step {stepIndex + 1} of {steps.length}</p>
                        <h2 className="text-3xl font-bold">{step.title}</h2>
                        <p className="text-muted-foreground">{step.description}</p>
                    </div>

                    <div className="flex gap-3">
                        {!isLastStep ? (
                            <Button variant="outline" onClick={skip}>Skip</Button>
                        ) : null}
                        <Button onClick={goNext}>{isLastStep ? "Finish" : "Next"}</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
