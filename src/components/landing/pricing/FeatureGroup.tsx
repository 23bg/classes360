import type { ReactNode } from "react";

type FeatureGroupProps = {
    title: string;
    children: ReactNode;
};

export default function FeatureGroup({ title, children }: FeatureGroupProps) {
    return (
        <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
            </h4>
            <ul className="space-y-2">{children}</ul>
        </section>
    );
}
