import { LegalNav } from "./LegalNav";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl">
      <LegalNav />
      {children}
    </div>
  );
}
