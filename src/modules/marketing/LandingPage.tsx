import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import JsonLd from "@/components/seo/JsonLd";
import Hero from "@/components/landing/Hero";
import LogoStrip from "@/components/landing/LogoStrip";
import Problem from "@/components/landing/Problem";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import PricingPreview from "@/components/landing/PricingPreview";
import CTA from "@/components/landing/CTA";
import UseCases from "@/components/landing/UseCases";
import TrustBar from "@/components/landing/TrustBar";
import LandingHeader from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import PageContainer from "@/components/layout/PageContainer";
import Section from "@/components/layout/Section";

export default function LandingPage() {
    const softwareAppSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Classes360",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {},
    };

    return (
        <>
            <JsonLd data={softwareAppSchema} />
            <LandingHeader />

            {/* Hero (full width) */}
            <Hero />

            {/* Page content wrapped in PageContainer */}
            <PageContainer>
                <Section className="py-0">
                    <LogoStrip />
                </Section>

                <Section>
                    <Problem />
                </Section>

                <Section>
                    <Features />
                </Section>

                <Section>
                    <HowItWorks />
                </Section>

                <Section>
                    <Testimonials />
                </Section>

                <Section>
                    <UseCases />
                </Section>

                <Section>
                    <TrustBar />
                </Section>

                <Section>
                    <PricingPreview />
                </Section>

                <Section className="pb-0">
                    <CTA />
                </Section>
            </PageContainer>

            <Footer />
        </>
    );
}
