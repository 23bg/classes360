import type { Metadata } from "next";
import { ReduxProvider } from "@/providers/ReduxProvider";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function StudentLoginLayout({ children }: { children: React.ReactNode }) {
    return <ReduxProvider>{children}</ReduxProvider>;
}
