"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { Product } from "@/lib/products";

interface Props {
  product: Product;
}

export function ProductDetailClient({ product }: Props) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.find((s) => s === "M") ?? product.sizes?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addItem(product, quantity, selectedColor, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="min-h-screen bg-black px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-white/40">
          <Link href="/" className="transition-colors hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/products" className="transition-colors hover:text-white">Products</Link>
          <span>/</span>
          <span className="text-white/70">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product image */}
          <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 lg:h-[500px]">
            <ProductVisual product={product} />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                {product.badge}
              </span>
            )}
          </div>

          {/* Product details */}
          <div className="flex flex-col">
            <p className="text-sm text-white/40 mb-2">{product.category}</p>
            <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
              {product.name}
            </h1>
            <p className="mb-6 text-3xl font-semibold text-white">
              ${product.price}
            </p>

            <p className="mb-8 text-white/60 leading-relaxed">
              {product.description}
            </p>

            {/* Color selection */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-sm font-semibold text-white">
                  Color:{" "}
                  <span className="font-normal text-white/60">
                    {selectedColor}
                  </span>
                </p>
                <div className="flex gap-2.5">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      className={`h-8 w-8 rounded-full transition-all ${
                        selectedColor === color
                          ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                          : "ring-1 ring-white/20"
                      } ${
                        color === "Black"
                          ? "bg-black border border-white/20"
                          : color === "White"
                          ? "bg-white"
                          : color === "Gray"
                          ? "bg-zinc-500"
                          : color === "Silver"
                          ? "bg-zinc-300"
                          : "bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-sm font-semibold text-white">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "bg-white text-black"
                          : "border border-white/20 text-white/60 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold text-white">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white transition-colors hover:bg-white/5"
                >
                  −
                </button>
                <span className="w-8 text-center text-white font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white transition-colors hover:bg-white/5"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-white text-black hover:bg-white/90"
              }`}
            >
              {added ? "✓ Added to Cart" : "Add to Cart"}
            </button>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: "🚚", label: "Free Shipping", sub: "on orders $75+" },
                { icon: "↩️", label: "Easy Returns", sub: "within 30 days" },
                { icon: "🔒", label: "Secure Checkout", sub: "256-bit SSL" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="rounded-xl border border-white/10 bg-zinc-950 p-3 text-center"
                >
                  <div className="text-xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-semibold text-white">
                    {badge.label}
                  </div>
                  <div className="text-xs text-white/40">{badge.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductVisual({ product }: { product: Product }) {
  const iconClass = "w-32 h-32 text-white/30";

  const icons: Record<string, React.ReactNode> = {
    "vercel-certified-tee": (
      <svg viewBox="0 0 80 80" fill="none" className={iconClass}>
        <path d="M20 15H60L70 30H55V65H25V30H10L20 15Z" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M30 15C30 20 35 25 40 25C45 25 50 20 50 15" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
        <path d="M37 35L41 42L37 49L43 49L40 42L43 35H37Z" fill="white" fillOpacity="0.6"/>
      </svg>
    ),
    "vercel-hoodie": (
      <svg viewBox="0 0 80 80" fill="none" className={iconClass}>
        <path d="M28 12C28 12 32 18 40 18C48 18 52 12 52 12L65 28H52V68H28V28H15L28 12Z" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="37" y="28" width="6" height="20" rx="3" fill="white" fillOpacity="0.3"/>
      </svg>
    ),
    "vercel-cap": (
      <svg viewBox="0 0 80 80" fill="none" className={iconClass}>
        <ellipse cx="40" cy="42" rx="24" ry="12" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
        <path d="M16 42C16 42 20 28 40 28C60 28 64 42 64 42" fill="white" fillOpacity="0.15"/>
        <path d="M16 42C16 42 20 28 40 28C60 28 64 42 64 42" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
        <path d="M10 46H36" stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  };

  const defaultIcon = (
    <div className="flex flex-col items-center gap-4 opacity-60">
      <svg height="64" viewBox="0 0 74 64" className="fill-white/40">
        <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" />
      </svg>
      <span className="text-white/30 text-sm">{product.name}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {icons[product.slug] ?? defaultIcon}
      <svg height="24" viewBox="0 0 74 64" className="fill-white/20">
        <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" />
      </svg>
    </div>
  );
}
