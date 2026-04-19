"use client";

import { useState, KeyboardEvent } from "react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export default function SearchInput({ onSearch, initialValue = "" }: SearchInputProps) {
  const [value, setValue] = useState(initialValue);

  const handleSearch = () => {
    onSearch(value.trim());
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2 items-center w-full">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search articles..."
          aria-label="Search"
          className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={handleSearch}
        className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 whitespace-nowrap"
      >
        Search
      </button>
    </div>
  );
}
