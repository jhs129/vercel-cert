export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  badge?: string;
  colors: string[];
  sizes?: string[];
  images: string[];
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    slug: "vercel-certified-tee",
    name: "Vercel Certified Tee",
    description:
      "Show off your Vercel certification with this premium cotton tee. Designed for developers who ship.",
    price: 35,
    category: "Apparel",
    badge: "New",
    colors: ["Black", "White"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    images: ["/products/tee-black.jpg"],
    featured: true,
  },
  {
    id: "2",
    slug: "vercel-hoodie",
    name: "Vercel Essentials Hoodie",
    description:
      "A heavyweight hoodie for late-night deploys. Soft fleece interior, embroidered Vercel logo.",
    price: 75,
    category: "Apparel",
    badge: "Best Seller",
    colors: ["Black", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    images: ["/products/hoodie-black.jpg"],
    featured: true,
  },
  {
    id: "3",
    slug: "vercel-cap",
    name: "Vercel Dad Cap",
    description:
      "Structured six-panel cap with embroidered Vercel wordmark. One size fits all.",
    price: 30,
    category: "Accessories",
    colors: ["Black", "White"],
    images: ["/products/cap-black.jpg"],
    featured: true,
  },
  {
    id: "4",
    slug: "vercel-sticker-pack",
    name: "Vercel Sticker Pack",
    description:
      "A collection of 10 premium die-cut stickers. Laptop-ready, waterproof, and dishwasher safe.",
    price: 12,
    category: "Accessories",
    badge: "Popular",
    colors: [],
    images: ["/products/stickers.jpg"],
    featured: true,
  },
  {
    id: "5",
    slug: "vercel-mug",
    name: "Vercel Ceramic Mug",
    description:
      "Start your morning deploy with this 12oz ceramic mug. Dishwasher safe, microwave safe.",
    price: 20,
    category: "Accessories",
    colors: ["Black", "White"],
    images: ["/products/mug-black.jpg"],
  },
  {
    id: "6",
    slug: "vercel-socks",
    name: "Vercel Socks",
    description:
      "Premium cotton blend socks with Vercel branding. Available in a pack of three.",
    price: 18,
    category: "Apparel",
    badge: "New",
    colors: ["Black"],
    sizes: ["S/M", "L/XL"],
    images: ["/products/socks.jpg"],
  },
  {
    id: "7",
    slug: "vercel-water-bottle",
    name: "Vercel Water Bottle",
    description:
      "Insulated stainless steel bottle. Keeps drinks cold for 24h, hot for 12h. 20oz.",
    price: 35,
    category: "Accessories",
    colors: ["Black", "Silver"],
    images: ["/products/bottle.jpg"],
  },
  {
    id: "8",
    slug: "vercel-notebook",
    name: "Vercel Notebook",
    description:
      "Dot-grid notebook with premium paper. 120 pages. Perfect for architecture diagrams.",
    price: 22,
    category: "Accessories",
    colors: ["Black"],
    images: ["/products/notebook.jpg"],
  },
];

export const categories = ["All", "Apparel", "Accessories"];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
}
