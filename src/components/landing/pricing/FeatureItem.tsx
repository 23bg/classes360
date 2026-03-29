import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

type FeatureItemProps = {
    label: string;
    included: boolean;
    value?: string;
};

export default function FeatureItem({ label, included, value }: FeatureItemProps) {
    return (
        <li
            className={cn(
                "flex items-start gap-2 text-sm leading-5",
                included ? "text-foreground" : "text-muted-foreground opacity-60"
            )}
        >
            {included ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            )}
            <span>
                {label}
                {included && value ? `: ${value}` : ""}
            </span>
        </li>
    );
}
