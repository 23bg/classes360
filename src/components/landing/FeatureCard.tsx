import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
    title: string;
    items: string[];
}

export function FeatureCard({ title, items }: FeatureCardProps) {
    return (
        <Card className="h-full border-border bg-card">
            <CardContent className="p-4 md:p-6 flex flex-col h-full">
                <h3 className="text-base md:text-lg font-medium text-foreground mb-4">{title}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground flex-1">
                    {items.map((item) => (
                        <li key={item}>• {item}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
