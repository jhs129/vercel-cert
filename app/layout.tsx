import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { GoogleTagManager } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Vercel News Site",
  description: "A sample news site built with Next.js and Builder.io",
  metadataBase: new URL("https://vercel-cert.jhsdigitalconsulting.com"),
  openGraph: {
    title: "Vercel News Site",
    description: "A sample news site built with Next.js and Builder.io",
    url: "https://vercel-cert.jhsdigitalconsulting.com",
    siteName: "Vercel News Site",
    images: [
      { url: "https://vercel-cert.jhsdigitalconsulting.com/og-image.png" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vercel News Site",
    description: "A sample news site built with Next.js and Builder.io",
    images: ["https://vercel-cert.jhsdigitalconsulting.com/og-image.png"],
  },
};

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans")}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col">
        {/* Third-party scripts — see CLAUDE.md "Third-Party Scripts" for loading conventions.
            GoogleTagManager uses afterInteractive internally (compliant).
            The noscript fallback is intentional — @next/third-parties does not include it. */}
        {gtmId && (
          <>
            <GoogleTagManager gtmId={gtmId} />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}
        <div className="container mx-auto px-page-gutter">
          <Header />
        </div>
        <Suspense>
          <AlertBanner />
        </Suspense>
        <main className="container mx-auto flex-1 px-page-gutter py-5">{children}</main>
        <Footer />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
