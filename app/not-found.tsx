import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-lg text-gray-400">This page could not be found.</p>
      <Link
        href="/"
        className="mt-4 px-6 py-2 bg-accent text-white rounded hover:opacity-80 transition-opacity"
      >
        Go home
      </Link>
    </main>
  );
}
