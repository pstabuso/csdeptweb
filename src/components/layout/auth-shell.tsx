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
    <main className="min-h-screen bg-[#120d20] px-4 py-6 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center">
        <section className="animate-enter w-full rounded-lg border border-white/10 bg-slate-950/78 p-6 shadow-[0_24px_90px_-48px_rgba(0,0,0,0.95)] backdrop-blur">
          <div className="mb-6 border-b border-white/10 pb-5">
            <p className="text-sm font-bold text-sky-300">
              CS Department Portal
            </p>
            <h1 className="mt-4 text-2xl font-bold text-white">{title}</h1>
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          </div>

          {children}

          <p className="mt-5 text-center text-sm text-slate-400">
            {footerLabel}{" "}
            <Link
              className="font-semibold text-sky-300 transition hover:text-sky-200"
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
