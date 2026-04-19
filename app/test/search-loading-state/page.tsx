import SearchLoadingState from "@/components/ui/SearchLoadingState";

export default function SearchLoadingStateTestPage() {
  return (
    <main className="p-8 space-y-12">
      <h1 className="text-2xl font-bold">SearchLoadingState — Test Page</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4">isLoading=true (skeleton visible)</h2>
        <SearchLoadingState isLoading={true} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">isLoading=false (renders nothing)</h2>
        <div className="border border-dashed border-border rounded p-4 text-muted text-sm">
          [SearchLoadingState with isLoading=false renders nothing here]
        </div>
        <SearchLoadingState isLoading={false} />
      </section>
    </main>
  );
}
