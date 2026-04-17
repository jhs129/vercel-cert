import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-black px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Glow effects */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              Vercel Certification Swag
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Gear up.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ship faster.
              </span>
            </h1>

            <p className="mb-8 text-lg text-white/50 sm:text-xl leading-relaxed max-w-xl mx-auto">
              Official merchandise for Vercel-certified developers. Show the
              world you build for the web.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.98]"
              >
                Shop All Products
              </Link>
              <Link
                href="/products?category=Apparel"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-all hover:bg-white/5"
              >
                Browse Apparel →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/10 bg-zinc-950 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Products", value: "8+" },
              { label: "Categories", value: "2" },
              { label: "Certified Devs", value: "10k+" },
              { label: "Ships Worldwide", value: "🌍" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-black px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">
                Handpicked
              </p>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Featured Products
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative overflow-hidden border-t border-white/10 bg-zinc-950 px-4 py-16 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
            Get Vercel Certified
          </h2>
          <p className="mb-6 text-white/50">
            Complete the Vercel certification to unlock exclusive discounts and
            become part of the developer community.
          </p>
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition-all hover:bg-white/90"
          >
            Learn about certification →
          </a>
        </div>
      </section>
    </div>
  );
}
