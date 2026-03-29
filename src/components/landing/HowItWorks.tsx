import { Card, CardContent } from "@/components/ui/card";

export default function HowItWorks() {
    const steps = [
        "Capture enquiry",
        "Assign follow-up",
        "Track progress",
        "Convert admission",
        "Manage student",
    ];

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="max-w-2xl space-y-4">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
                        One system to manage admissions
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Every team member follows the same structured flow from first enquiry to enrolled student.
                    </p>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                    {steps.map((step, index) => (
                        <Card key={step} className="border-border bg-card h-full">
                            <CardContent className="p-4 flex flex-col items-center">
                                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary bg-background text-sm font-semibold text-primary">
                                    {index + 1}
                                </div>
                                <p className="font-medium text-center text-sm md:text-base text-foreground">{step}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

