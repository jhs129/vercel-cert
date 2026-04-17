"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function CartPageClient() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-black px-4 py-24 text-center">
        <svg height="48" viewBox="0 0 74 64" className="fill-white/20 mb-6">
          <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" />
        </svg>
        <h1 className="mb-3 text-2xl font-bold text-white">Your cart is empty</h1>
        <p className="mb-8 text-white/50">
          Looks like you haven't added anything yet.
        </p>
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition-all hover:bg-white/90"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm text-white/40 transition-colors hover:text-white"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 rounded-xl border border-white/10 bg-zinc-950 p-4"
              >
                {/* Product icon */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-900">
                  <svg height="20" viewBox="0 0 74 64" className="fill-white/40">
                    <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" />
                  </svg>
                </div>

                {/* Item details */}
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm font-semibold text-white hover:text-white/80"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex gap-3 mt-0.5">
                        {item.selectedColor && (
                          <span className="text-xs text-white/40">
                            {item.selectedColor}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="text-xs text-white/40">
                            {item.selectedSize}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 text-white text-xs transition-colors hover:bg-white/5"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 text-white text-xs transition-colors hover:bg-white/5"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-xs text-white/30 transition-colors hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-white/10 bg-zinc-950 p-6">
              <h2 className="mb-4 text-lg font-bold text-white">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Shipping</span>
                  <span className={total >= 75 ? "text-green-400" : ""}>
                    {total >= 75 ? "Free" : "$8.00"}
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Tax</span>
                  <span>${(total * 0.08).toFixed(2)}</span>
                </div>
              </div>

              <div className="my-4 border-t border-white/10" />

              <div className="flex justify-between font-semibold text-white">
                <span>Total</span>
                <span>
                  ${(total + (total >= 75 ? 0 : 8) + total * 0.08).toFixed(2)}
                </span>
              </div>

              {total < 75 && (
                <p className="mt-3 text-xs text-white/40 text-center">
                  Add ${(75 - total).toFixed(2)} more for free shipping
                </p>
              )}

              <button className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.98]">
                Checkout
              </button>

              <Link
                href="/products"
                className="mt-3 block text-center text-sm text-white/40 transition-colors hover:text-white"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
