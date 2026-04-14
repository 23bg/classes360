import type { Metadata } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import PWARegistration from "@/components/pwa/PWARegistration";


export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL("https://classes360.online"),
  manifest: "/manifest.json",
  title: {
    default: "Classes360 - Admission CRM for Coaching Institutes",
    template: "%s | Classes360",
  },
  description:
    "Classes360 helps coaching institutes capture enquiries, manage admissions, track students, courses and fees.",
  keywords: [
    "admission crm",
    "coaching institute crm",
    "student management software",
    "admission management system",
    "student admission software",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "https://classes360.online",
    siteName: "Classes360",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Classes360 Admission CRM",
    description: "Admission and student management platform for coaching institutes.",
    images: ["/og-image.png"],
  },
};

// ensureInitialUser();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable}`}
    >
      <body className="bg-background text-foreground antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NextTopLoader showSpinner={false} color="var(--color-primary)" shadow={false} />
            <PWARegistration />
            {children}
            <Toaster
              duration={3000}
              position="bottom-right"
              richColors
              expand
              offset={{ bottom: "1.5rem" }}
            />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

