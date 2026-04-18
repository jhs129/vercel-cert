import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
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
      <body className="container mx-auto min-h-full bg-background text-foreground">
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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
