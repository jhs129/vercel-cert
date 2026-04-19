interface SearchEmptyStateProps {
  query: string;
  onClearSearch: () => void;
}

export default function SearchEmptyState({ query, onClearSearch }: SearchEmptyStateProps) {
  return (
    <div
      aria-live="polite"
      className="flex flex-col items-center gap-4 py-16 text-center"
    >
      <p className="text-lg text-muted">
        {query ? (
          <>No results for &ldquo;<span className="text-foreground font-medium">{query}</span>&rdquo;</>
        ) : (
          "No articles available yet"
        )}
      </p>
      {query && (
        <button
          type="button"
          onClick={onClearSearch}
          className="text-sm text-accent underline underline-offset-2 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          Clear search
        </button>
      )}
    </div>
  );
}
