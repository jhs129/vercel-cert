interface SearchLoadingStateProps {
  isLoading: boolean;
}

export default function SearchLoadingState({ isLoading }: SearchLoadingStateProps) {
  if (!isLoading) return null;

  return (
    <div aria-label="Loading results" role="status" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border border-border overflow-hidden animate-pulse">
          <div className="aspect-video w-full bg-muted/30" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-4 w-3/4 rounded bg-muted/30" />
            <div className="h-3 w-1/2 rounded bg-muted/30" />
            <div className="h-3 w-full rounded bg-muted/30" />
            <div className="h-3 w-5/6 rounded bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
