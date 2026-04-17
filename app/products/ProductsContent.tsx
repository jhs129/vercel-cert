"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getProductsByCategory, categories } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeCategory = searchParams.get("category") ?? "All";

  const products = getProductsByCategory(activeCategory);

  function setCategory(cat: string) {
    const params = new URLSearchParams(searchParams);
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  return (
    <div className="min-h-screen bg-black px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-2">
            Vercel Swag Store
          </p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            All Products
          </h1>
          <p className="mt-2 text-white/50">
            {products.length} item{products.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-white text-black"
                  : "border border-white/20 text-white/60 hover:border-white/40 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="py-24 text-center text-white/40">
            No products found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
