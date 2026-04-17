"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER_COLORS: Record<string, string> = {
  "vercel-certified-tee": "from-zinc-900 to-zinc-800",
  "vercel-hoodie": "from-zinc-900 to-zinc-700",
  "vercel-cap": "from-zinc-900 to-neutral-800",
  "vercel-sticker-pack": "from-blue-950 to-indigo-900",
  "vercel-mug": "from-zinc-900 to-zinc-800",
  "vercel-socks": "from-zinc-900 to-zinc-800",
  "vercel-water-bottle": "from-zinc-900 to-slate-800",
  "vercel-notebook": "from-zinc-900 to-zinc-800",
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const gradientClass =
    PLACEHOLDER_COLORS[product.slug] ?? "from-zinc-900 to-zinc-800";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50">
      {/* Product image placeholder */}
      <Link href={`/products/${product.slug}`} className="block">
        <div
          className={`relative flex h-56 items-center justify-center bg-gradient-to-br ${gradientClass} overflow-hidden`}
        >
          <ProductIcon slug={product.slug} />

          {/* Badge */}
          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-black">
              {product.badge}
            </span>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </Link>

      {/* Product info */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="mb-0.5 text-xs text-white/40">{product.category}</p>
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-sm font-semibold text-white transition-colors group-hover:text-white/90 leading-snug">
                {product.name}
              </h3>
            </Link>
          </div>
          <span className="shrink-0 text-sm font-semibold text-white">
            ${product.price}
          </span>
        </div>

        {/* Color swatches */}
        {product.colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {product.colors.map((color) => (
              <div
                key={color}
                title={color}
                className={`h-3.5 w-3.5 rounded-full border border-white/20 ${
                  color === "Black"
                    ? "bg-black"
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
            <span className="text-xs text-white/40">
              {product.colors.length} color{product.colors.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Add to cart button */}
        <button
          onClick={() => addItem(product)}
          className="mt-auto w-full rounded-lg bg-white py-2 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.98]"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function ProductIcon({ slug }: { slug: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    "vercel-certified-tee": <TeeIcon />,
    "vercel-hoodie": <HoodieIcon />,
    "vercel-cap": <CapIcon />,
    "vercel-sticker-pack": <StickerIcon />,
    "vercel-mug": <MugIcon />,
    "vercel-socks": <SocksIcon />,
    "vercel-water-bottle": <BottleIcon />,
    "vercel-notebook": <NotebookIcon />,
  };

  return (
    <div className="flex flex-col items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
      {iconMap[slug] ?? <DefaultProductIcon />}
      <svg height="16" viewBox="0 0 74 64" className="fill-white/30">
        <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" />
      </svg>
    </div>
  );
}

function TeeIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 15H60L70 30H55V65H25V30H10L20 15Z" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M30 15C30 20 35 25 40 25C45 25 50 20 50 15" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
      <path d="M37 35L41 42L37 49L43 49L40 42L43 35H37Z" fill="white" fillOpacity="0.4"/>
    </svg>
  );
}

function HoodieIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 12C28 12 32 18 40 18C48 18 52 12 52 12L65 28H52V68H28V28H15L28 12Z" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M36 18C36 18 37 22 40 22C43 22 44 18 44 18" stroke="white" strokeOpacity="0.4" strokeWidth="1.5"/>
      <rect x="37" y="28" width="6" height="20" rx="3" fill="white" fillOpacity="0.3"/>
    </svg>
  );
}

function CapIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="42" rx="24" ry="12" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
      <path d="M16 42C16 42 20 28 40 28C60 28 64 42 64 42" fill="white" fillOpacity="0.15"/>
      <path d="M16 42C16 42 20 28 40 28C60 28 64 42 64 42" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
      <path d="M10 46H36" stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round"/>
      <path d="M37 35L41 42H37V35Z" fill="white" fillOpacity="0.5"/>
    </svg>
  );
}

function StickerIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="18" width="30" height="22" rx="3" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" transform="rotate(-8 15 18)"/>
      <rect x="30" y="30" width="28" height="22" rx="3" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" transform="rotate(5 30 30)"/>
      <path d="M34 37L37 43L34 50L40 50L38 43L40 37H34Z" fill="white" fillOpacity="0.6"/>
    </svg>
  );
}

function MugIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="28" width="34" height="32" rx="3" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
      <path d="M52 36C52 36 60 36 60 44C60 52 52 52 52 52" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
      <path d="M24 28V22" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 28V24" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M40 28V22" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M29 40L32 47L29 54L35 54L33 47L35 40H29Z" fill="white" fillOpacity="0.4"/>
    </svg>
  );
}

function SocksIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 15H38V50C38 50 42 55 42 60C42 65 35 65 35 60C35 55 28 50 28 50V15Z" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M44 15H54V50C54 50 58 55 58 60C58 65 51 65 51 60C51 55 44 50 44 50V15Z" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M28 22H38" stroke="white" strokeOpacity="0.5" strokeWidth="2"/>
      <path d="M28 26H38" stroke="white" strokeOpacity="0.3" strokeWidth="1"/>
    </svg>
  );
}

function BottleIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="32" y="12" width="16" height="6" rx="2" fill="white" fillOpacity="0.3" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
      <path d="M28 22C28 22 26 26 26 28V64C26 66 27 68 30 68H50C53 68 54 66 54 64V28C54 26 52 22 52 22H28Z" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
      <rect x="32" y="18" width="16" height="4" fill="white" fillOpacity="0.2"/>
      <path d="M31 37L35 44L31 51L37 51L35 44L37 37H31Z" fill="white" fillOpacity="0.4"/>
    </svg>
  );
}

function NotebookIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="15" width="42" height="52" rx="3" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
      <rect x="16" y="15" width="8" height="52" rx="2" fill="white" fillOpacity="0.05" stroke="white" strokeOpacity="0.3" strokeWidth="1.5"/>
      <line x1="28" y1="28" x2="54" y2="28" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
      <line x1="28" y1="34" x2="54" y2="34" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
      <line x1="28" y1="40" x2="54" y2="40" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
      <line x1="28" y1="46" x2="46" y2="46" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
      <path d="M33 52L37 59L33 66L39 66L37 59L39 52H33Z" fill="white" fillOpacity="0.4"/>
    </svg>
  );
}

function DefaultProductIcon() {
  return (
    <div className="h-16 w-16 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 74 64" className="fill-white/60">
        <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" />
      </svg>
    </div>
  );
}
