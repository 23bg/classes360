import React from "react";

type PageContainerProps = {
    children: React.ReactNode;
    className?: string;
};

export default function PageContainer({ children, className = "" }: PageContainerProps) {
    return (
        <main className={`max-w-7xl mx-auto px-4 md:px-6 p-6 space-y-6 ${className}`}>
            {children}
        </main>
    );
}
