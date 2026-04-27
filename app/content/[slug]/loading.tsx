export default function ArticleLoading() {
  return (
    <div className="max-w-3xl mx-auto py-8 animate-pulse" role="status" aria-label="Loading article">
      <div className="w-full aspect-video mb-8 rounded-lg bg-muted/30" />

      <header className="mb-8">
        <div className="h-10 w-3/4 rounded bg-muted/30 mb-3" />
        <div className="h-4 w-32 rounded bg-muted/30" />
      </header>

      <div className="flex flex-col gap-3">
        <div className="h-4 w-full rounded bg-muted/30" />
        <div className="h-4 w-11/12 rounded bg-muted/30" />
        <div className="h-4 w-full rounded bg-muted/30" />
        <div className="h-4 w-4/5 rounded bg-muted/30" />
        <div className="h-4 w-full rounded bg-muted/30" />
        <div className="h-4 w-3/4 rounded bg-muted/30" />
        <div className="h-4 w-full rounded bg-muted/30" />
        <div className="h-4 w-10/12 rounded bg-muted/30" />
      </div>
    </div>
  );
}
