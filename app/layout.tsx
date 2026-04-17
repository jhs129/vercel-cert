import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Vercel Swag Store",
  description:
    "Official merchandise for Vercel-certified developers. Shop tees, hoodies, accessories and more.",
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
      <body className="min-h-full flex flex-col bg-black text-white">
        <CartProvider>
          <Navbar />
          <main className="flex-1 pt-14">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
