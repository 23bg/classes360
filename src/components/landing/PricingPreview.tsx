import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const plans = [
    { name: "Starter", price: "INR 999/mo", summary: "For solo institute owners" },
    { name: "Team", price: "INR 1,999/mo", summary: "For small admission teams" },
    { name: "Growth", price: "INR 3,499/mo", summary: "For scaling operations" },
];

export default function PricingPreview() {
    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl space-y-4">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">Simple plans for every stage</h2>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Choose a plan based on team size and admissions volume. Upgrade as your institute grows.
                        </p>
                    </div>
                    <Button asChild className="w-full md:w-auto">
                        <Link href="/pricing">View full pricing</Link>
                    </Button>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card key={plan.name} className="border-border bg-card h-full">
                            <CardContent className="p-4 md:p-6 flex flex-col h-full">
                                <h3 className="text-sm font-semibold text-primary">{plan.name}</h3>
                                <p className="mt-2 text-2xl font-bold text-foreground">{plan.price}</p>
                                <p className="mt-2 text-sm text-muted-foreground">{plan.summary}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
