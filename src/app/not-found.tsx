import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 text-ink">
      <div className="card max-w-md p-8 text-center">
        <p className="eyebrow">Not found</p>
        <h1 className="mt-1 text-2xl font-semibold">We couldn&apos;t find that page</h1>
        <p className="muted mt-2">
          It may have been removed, or you may not have access to it.
        </p>
        <Link href="/dashboard" className="btn-primary mt-6">
          Go to my dashboard
        </Link>
      </div>
    </main>
  );
}
