import { ReactNode } from "react";

interface SectionWrapperProps {
    children: ReactNode;
    className?: string;
}

export function SectionWrapper({ children, className = "" }: SectionWrapperProps) {
    return (
        <section className={`w-full py-6 md:py-8 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 md:px-6">{children}</div>
        </section>
    );
}
