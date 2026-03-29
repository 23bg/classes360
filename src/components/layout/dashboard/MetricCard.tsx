import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
    label: string;
    value: string | number;
    icon: LucideIcon;
    iconClassName?: string;
};

export default function MetricCard({ label, value, icon: Icon, iconClassName }: MetricCardProps) {
    return (
        <Card className="rounded-lg shadow-sm border border-zinc-200  dark:border-zinc-700/40 hover:bg-foreground/5 transition-colors hover:text-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className={`h-5 w-5 ${iconClassName || ""}`.trim()} />
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{value}</p>
            </CardContent>
        </Card>
    );
}