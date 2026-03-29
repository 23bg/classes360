import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface InfoBlockProps {
    icon?: ReactNode;
    title: string;
    children: ReactNode;
    className?: string;
}

export function InfoBlock({ icon, title, children, className = "" }: InfoBlockProps) {
    return (
        <Card className={`border-border bg-card ${className}`}>
            <CardContent className="p-4 md:p-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2">
                    {icon && <span className="text-primary">{icon}</span>}
                    <span className="text-base md:text-lg font-medium text-foreground">{title}</span>
                </div>
                <div className="text-sm text-muted-foreground">{children}</div>
            </CardContent>
        </Card>
    );
}
