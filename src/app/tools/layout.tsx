import Footer from "@/components/landing/Footer";
import LandingHeader from "@/components/landing/Header";

export const revalidate = 3600;

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <LandingHeader />
            {children}
            <Footer />
        </>
    );
}
