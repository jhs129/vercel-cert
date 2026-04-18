import type { Metadata } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { GoogleTagManager } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Vercel App",
  description: "A Next.js shell application.",
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
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col">
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
        <div className="container mx-auto">
          <Header />
          <Suspense>
            <AlertBanner />
          </Suspense>
        </div>
        <main className="container mx-auto flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
