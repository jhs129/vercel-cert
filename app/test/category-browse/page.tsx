import CategoryBrowse from "@/components/ui/CategoryBrowse";

export default function CategoryBrowseTestPage() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">CategoryBrowse — Test Page</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-500">Light Theme (Default)</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <CategoryBrowse title="Browse Articles" theme="light" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-500">Dark Theme</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <CategoryBrowse title="Browse Articles" theme="dark" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-500">Custom Title / No Title</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <CategoryBrowse theme="light" />
        </div>
      </section>
    </main>
  );
}
