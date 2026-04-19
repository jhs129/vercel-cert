import Button from "@/components/ui/Button/index";

export default function ButtonTestPage() {
  return (
    <main className="p-8 space-y-8">
      <h1>Button Component Test Page</h1>

      <section className="space-y-4">
        <h2>Default (Primary Variant)</h2>
        <Button label="Default Button" />
      </section>

      <section className="space-y-4">
        <h2>Primary Variant</h2>
        <Button label="Primary Button" variant="primary" theme="light" />
      </section>

      <section className="space-y-4">
        <h2>Secondary Variant</h2>
        <Button label="Secondary Button" variant="secondary" theme="light" />
      </section>

      <section className="space-y-4">
        <h2>With href (renders as anchor tag)</h2>
        <Button label="Go to Homepage" href="/" variant="primary" theme="light" />
      </section>

      <section className="space-y-4 bg-black p-6 rounded-md">
        <h2 className="text-white">Dark Theme</h2>
        <Button label="Dark Primary" variant="primary" theme="dark" />
        <Button label="Dark Secondary" variant="secondary" theme="dark" />
      </section>

      <section className="space-y-4">
        <h2>With Styles Prop</h2>
        <Button label="Full Width Button" variant="primary" theme="light" styles="w-full" />
      </section>

      <section className="space-y-4">
        <h2>Empty / Undefined Label (no crash)</h2>
        <Button />
      </section>
    </main>
  );
}
