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
  description: string;
  children: React.ReactNode;
};

const roleStyles: Record<Role, string> = {
  STUDENT: "bg-sky-400/15 text-sky-200 ring-1 ring-inset ring-sky-300/30",
  COORDINATOR:
    "bg-emerald-400/15 text-emerald-200 ring-1 ring-inset ring-emerald-300/30",
  SECRETARY: "bg-amber-400/15 text-amber-200 ring-1 ring-inset ring-amber-300/30",
  ADMIN: "bg-fuchsia-400/15 text-fuchsia-200 ring-1 ring-inset ring-fuchsia-300/30",
};

export function AppShell({
  user,
  title,
  description,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_28%),radial-gradient(circle_at_right,_rgba(168,85,247,0.12),_transparent_20%),linear-gradient(135deg,_#050b16_0%,_#091221_46%,_#0c1b2f_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="mb-8 rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span
                className={cx(
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase",
                  roleStyles[user.role],
                )}
              >
                {user.role.replaceAll("_", " ")}
              </span>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  {description}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>
                <p className="truncate text-sm text-slate-400">{user.email}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
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
