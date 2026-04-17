import { Suspense } from "react";
import { ProductsContent } from "./ProductsContent";

export const metadata = {
  title: "Products — Vercel Swag Store",
  description: "Browse all Vercel swag products.",
};

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
