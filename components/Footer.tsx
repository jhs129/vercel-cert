import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg
                aria-label="Vercel logo"
                height="18"
                viewBox="0 0 74 64"
                className="text-white fill-current"
              >
                <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" />
              </svg>
              <span className="text-sm font-semibold text-white">
                Swag Store
              </span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Official merchandise for Vercel-certified developers.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
              Shop
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href="/products" className="transition-colors hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=Apparel" className="transition-colors hover:text-white">
                  Apparel
                </Link>
              </li>
              <li>
                <Link href="/products?category=Accessories" className="transition-colors hover:text-white">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
              Info
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                  Vercel.com
                </a>
              </li>
              <li>
                <a href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Shipping Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Vercel, Inc. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Made with ▲ Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
