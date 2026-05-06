import { Role } from "@prisma/client";
import Link from "next/link";

import { logout } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";
import { cx } from "@/lib/cx";

type AppShellProps = {
  user: {
    name: string;
    email: string;
    role: Role;
  };
  title: string;
  description?: string;
  children: React.ReactNode;
};

const roleStyles: Record<Role, string> = {
  STUDENT: "bg-violet-400/15 text-violet-100 ring-1 ring-inset ring-violet-300/30",
  COORDINATOR:
    "bg-fuchsia-400/15 text-fuchsia-100 ring-1 ring-inset ring-fuchsia-300/30",
  SECRETARY: "bg-purple-400/15 text-purple-100 ring-1 ring-inset ring-purple-300/30",
  ADMIN: "bg-violet-300/15 text-violet-50 ring-1 ring-inset ring-violet-200/30",
};

export function AppShell({
  user,
  title,
  description,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(192,132,252,0.18),_transparent_30%),radial-gradient(circle_at_right,_rgba(139,92,246,0.16),_transparent_22%),linear-gradient(135deg,_#0f0918_0%,_#181126_42%,_#221533_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 lg:px-6">
        <header className="mb-5 rounded-[1.6rem] border border-white/10 bg-slate-950/45 p-4 shadow-[0_20px_70px_-45px_rgba(12,7,24,0.95)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <span
                className={cx(
                  "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase",
                  roleStyles[user.role],
                )}
              >
                {user.role.replaceAll("_", " ")}
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-[1.2rem] border border-white/10 bg-white/5 p-3 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>
                <p className="truncate text-sm text-slate-400">{user.email}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-violet-400/10 px-3 py-2 text-sm font-semibold text-violet-50 transition hover:bg-violet-400/20"
                >
                  Profile
                </Link>
                <form action={logout}>
                  <SubmitButton
                    pendingLabel="Signing out..."
                    className="w-full rounded-xl px-3 py-2 text-sm sm:w-auto"
                  >
                    Log out
                  </SubmitButton>
                </form>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
