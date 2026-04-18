import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";

export const metadata: Metadata = {
  title: "Vercel App",
  description: "A Next.js shell application.",
};

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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
