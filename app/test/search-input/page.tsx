"use client";

import { useState } from "react";
import SearchInput from "@/components/ui/SearchInput";

export default function SearchInputTestPage() {
  const [value, setValue] = useState("");
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    setLastQuery(query);
  };

  return (
    <main className="p-8 space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">SearchInput — Test Page</h1>

      <section className="space-y-2">
        <h2 className="font-semibold text-lg">Default (empty)</h2>
        <SearchInput value={value} onChange={setValue} onSearch={handleSearch} />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-lg">Narrow container (320px)</h2>
        <div className="w-80">
          <SearchInput value={value} onChange={setValue} onSearch={handleSearch} />
        </div>
      </section>

      {lastQuery !== null && (
        <p className="text-muted text-sm">
          Last search: <strong>&quot;{lastQuery}&quot;</strong>
        </p>
      )}
    </main>
  );
}
