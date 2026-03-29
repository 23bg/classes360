import { FeatureCard } from "@/components/landing/FeatureCard";

const modules = [
    {
        title: "Admission Pipeline",
        items: ["Enquiry capture", "Follow-ups", "Conversion tracking"],
    },
    {
        title: "Student & Courses",
        items: ["Student records", "Batch/course mapping", "Payments"],
    },
    {
        title: "Team Workflow",
        items: ["Assign leads", "Track ownership", "Team visibility"],
    },
    {
        title: "Communication",
        items: ["WhatsApp alerts", "Notifications"],
    },
    {
        title: "Integrations",
        items: ["WhatsApp Business", "Razorpay", "Email"],
    },
];

export default function Features() {
    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="max-w-2xl space-y-4">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
                        Product modules built like a system
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Classes360 is organized into structured modules so each team can execute admissions reliably.
                    </p>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {modules.map((module) => (
                        <FeatureCard key={module.title} title={module.title} items={module.items} />
                    ))}
                </div>
            </div>
        </div>
    );
}

