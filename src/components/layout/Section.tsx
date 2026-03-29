import React from "react";

type SectionProps = {
    title?: string;
    children: React.ReactNode;
    className?: string;
};

export default function Section({ title, children, className = "" }: SectionProps) {
    return (
        <section className={`space-y-6 ${className}`}>
            {title ? (
                <h2 className="text-lg md:text-xl font-medium text-foreground">{title}</h2>
            ) : null}
            {children}
        </section>
    );
}
