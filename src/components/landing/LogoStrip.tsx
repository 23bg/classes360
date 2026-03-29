import { cn } from "@/lib/utils";

const logos = [
    "Apex Coaching",
    "Bright Future Academy",
    "Prime NEET Classes",
    "Vertex Tutorials",
    "SkillSprint Institute",
    "Success Point",
    "Pioneer Learning",
    "Scholars Hub",
    "MentorEdge",
    "NextRank Academy",
];

type LogoStripProps = {
    title?: string;
    subtitle?: string;
    compact?: boolean;
};

export default function LogoStrip({
    title = "Trusted by coaching institutes across India",
    subtitle = "50+ institutes • 3,000+ enquiries managed monthly",
    compact = false,
}: LogoStripProps) {
    return (
        <div className={cn("w-full border-b bg-card", compact ? "py-6" : "py-8 md:py-12 lg:py-16")}>
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">{title}</h2>
                    <p className="mt-2 text-sm md:text-base text-muted-foreground">{subtitle}</p>
                </div>
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {logos.map((logo) => (
                        <div
                            key={logo}
                            className="rounded-lg border border-border bg-background px-4 py-3 text-center text-xs font-medium text-muted-foreground transition-all hover:scale-[1.03] hover:shadow-md"
                        >
                            {logo}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
