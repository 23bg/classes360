import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type StatsCardProps = {
    title: string;
    value: string;
    delta?: string;
    className?: string;
};

export default function StatsCard({ title, value, delta, className = "" }: StatsCardProps) {
    return (
        <Card className={`border-border bg-card ${className}`}>
            <CardContent className="p-4 md:p-6">
                <h3 className="text-sm text-muted-foreground">{title}</h3>
                <div className="mt-2 flex items-baseline gap-3">
                    <p className="text-2xl font-semibold text-foreground">{value}</p>
                    {delta && <span className="text-sm text-muted-foreground">{delta}</span>}
                </div>
            </CardContent>
        </Card>
    );
}
