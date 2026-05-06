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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(196,181,253,0.25),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_20%),linear-gradient(160deg,_#0b0914_0%,_#130d22_40%,_#1a1230_100%)] px-4 py-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-4 lg:grid-cols-[minmax(0,1.05fr)_460px]">
        <section className="hidden rounded-[2rem] border border-white/10 bg-slate-950/58 p-8 shadow-[0_24px_90px_-55px_rgba(10,8,22,0.98)] backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-200/80">
              CS Dept Portal
            </p>
            <h1 className="max-w-lg text-5xl font-semibold tracking-tight text-white">
              Faster support flow.
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-300">
              One queue for concerns, one schedule for visibility, one access model
              controlled by admin.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Access
              </p>
              <p className="mt-2 text-base font-semibold text-white">Role-based</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Timezone
              </p>
              <p className="mt-2 text-base font-semibold text-white">PH time</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Security
              </p>
              <p className="mt-2 text-base font-semibold text-white">STRIDE-led</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/72 p-6 shadow-[0_24px_90px_-55px_rgba(10,8,22,0.98)] backdrop-blur-xl sm:p-7">
            <div className="mb-6 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-200/80">
                CS Dept
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                {title}
              </h2>
              <p className="text-sm text-slate-400">{subtitle}</p>
            </div>

            {children}

            <p className="mt-5 text-center text-sm text-slate-400">
              {footerLabel}{" "}
              <Link
                className="font-semibold text-violet-300 transition hover:text-violet-200"
                href={footerHref}
              >
                {footerAction}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
