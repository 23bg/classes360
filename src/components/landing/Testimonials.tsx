import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
    {
        institute: "Apex JEE Academy",
        role: "Owner",
        quote: "Before Classes360, we lost 30% enquiries. Now every enquiry has a clear follow-up owner.",
    },
    {
        institute: "FutureRank Classes",
        role: "Admin",
        quote: "Our team moved from spreadsheets to a single workflow. Admissions are now tracked end-to-end.",
    },
    {
        institute: "Nucleus Learning Hub",
        role: "Owner",
        quote: "We scaled counselling operations without chaos. Visibility across team members improved immediately.",
    },
];

export default function Testimonials() {
    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="max-w-2xl space-y-4">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
                        Results from real institutes
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Teams choose Classes360 for operational clarity, faster follow-ups, and predictable admissions execution.
                    </p>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((item) => (
                        <Card key={item.institute} className="border-border bg-card h-full">
                            <CardContent className="p-4 md:p-6 flex flex-col h-full">
                                <Quote className="h-5 w-5 text-primary" aria-hidden />
                                <p className="mt-4 text-sm leading-6 text-foreground">"{item.quote}"</p>
                                <div className="mt-5 border-t pt-3">
                                    <p className="text-sm font-semibold text-foreground">{item.institute}</p>
                                    <p className="text-xs text-muted-foreground">{item.role}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
