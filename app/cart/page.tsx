import { Metadata } from "next";
import { CartPageClient } from "./CartPageClient";

export const metadata: Metadata = {
  title: "Cart — Vercel Swag Store",
};

export default function CartPage() {
  return <CartPageClient />;
}
