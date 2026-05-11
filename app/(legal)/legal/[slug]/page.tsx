import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrivacyDocument, TermsDocument } from "./legal-documents";

const LEGAL_SLUGS = ["terms", "privacy"] as const;
type LegalSlug = (typeof LEGAL_SLUGS)[number];

function isLegalSlug(slug: string): slug is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(slug);
}

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isLegalSlug(slug)) {
    return {};
  }
  if (slug === "privacy") {
    return {
      title: "Privacy Policy",
      description: "How we collect, use, and protect information when you use this website.",
    };
  }
  return {
    title: "Terms of Service",
    description: "Rules and conditions for using this website and related services.",
  };
}

export default async function LegalSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) {
    notFound();
  }

  if (slug === "privacy") {
    return <PrivacyDocument />;
  }

  return <TermsDocument />;
}
