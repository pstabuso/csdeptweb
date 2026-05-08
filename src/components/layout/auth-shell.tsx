import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerHref: string;
  footerLabel: string;
  footerAction: string;
};

export function AuthShell({
  title,
  subtitle,
  children,
  footerHref,
  footerLabel,
  footerAction,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#eef2f6] px-4 py-6 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center">
        <section className="animate-enter w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 border-b border-slate-200 pb-5">
            <p className="text-sm font-bold text-sky-700">
              CS Department Portal
            </p>
            <h1 className="mt-4 text-2xl font-bold text-slate-950">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>

          {children}

          <p className="mt-5 text-center text-sm text-slate-500">
            {footerLabel}{" "}
            <Link
              className="font-semibold text-sky-700 transition hover:text-sky-600"
              href={footerHref}
            >
              {footerAction}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
