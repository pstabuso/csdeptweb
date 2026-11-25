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
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10 text-ink">
      <div className="animate-enter w-full max-w-md">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500 text-sm font-bold text-white">
            CS
          </span>
          <span>
            <span className="block text-sm font-semibold">CS Department</span>
            <span className="block text-xs text-ink-faint">Support portal</span>
          </span>
        </div>

        <section className="card p-6">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="muted mt-1">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </section>

        <p className="mt-5 text-center text-sm text-ink-muted">
          {footerLabel}{" "}
          <Link className="font-medium text-violet-300 hover:text-violet-200" href={footerHref}>
            {footerAction}
          </Link>
        </p>
      </div>
    </main>
  );
}
