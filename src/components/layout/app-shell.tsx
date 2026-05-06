import { Role } from "@prisma/client";
import Link from "next/link";

import { logout } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";
import { SidebarClock } from "@/components/layout/sidebar-clock";
import { cx } from "@/lib/cx";
import { getRoleNavigation } from "@/lib/security";

type AppShellProps = {
  user: {
    name: string;
    email: string;
    role: Role;
  };
  title: string;
  description?: string;
  currentPath: string;
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
  currentPath,
  children,
}: AppShellProps) {
  const navigation = getRoleNavigation(user.role);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(196,181,253,0.22),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.18),_transparent_18%),linear-gradient(160deg,_#0b0914_0%,_#130d22_40%,_#1a1230_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1750px] gap-6 px-4 py-4 xl:px-6">
        <aside className="hidden lg:flex lg:w-[21rem] lg:flex-col lg:gap-5 lg:rounded-[2.2rem] lg:border lg:border-white/10 lg:bg-slate-950/60 lg:p-5 lg:shadow-[0_24px_90px_-55px_rgba(10,8,22,0.98)] lg:backdrop-blur-xl">
          <div className="portal-surface portal-enter rounded-[1.8rem] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-200/80">
              CS Dept
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Portal
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              <SidebarClock />
            </p>
          </div>

          <div className="portal-surface portal-enter rounded-[1.8rem] p-4 [animation-delay:120ms]">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Navigation
            </p>
            <nav className="mt-3 space-y-2">
            {navigation.map((item) => {
              const isActive =
                currentPath === item.href || currentPath.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "group flex items-start justify-between rounded-[1.4rem] border px-4 py-3.5 transition duration-500 ease-out",
                    isActive
                      ? "border-violet-300/30 bg-violet-400/15 text-white shadow-[0_18px_36px_-24px_rgba(167,139,250,0.9)]"
                      : "border-white/8 bg-white/[0.03] text-slate-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05] hover:text-white",
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500 transition group-hover:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                  <span className="mt-0.5 text-xs text-slate-500 transition group-hover:text-slate-300">
                    /
                  </span>
                </Link>
              );
            })}
            </nav>
          </div>

          <div className="portal-surface portal-enter rounded-[1.8rem] p-4 [animation-delay:220ms]">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Workspace
            </p>
            <div className="mt-3 grid gap-3">
              <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200/80">
                  Role
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {user.role.replaceAll("_", " ")}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200/80">
                  Mode
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {user.role === Role.STUDENT
                    ? "Track requests and posted availability."
                    : user.role === Role.ADMIN
                      ? "Monitor activity and adjust access."
                      : "Work the queue and keep the calendar current."}
                </p>
              </div>
            </div>
          </div>

          <div className="portal-surface portal-enter mt-auto space-y-4 rounded-[1.8rem] p-5 [animation-delay:320ms]">
            <span
              className={cx(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase",
                roleStyles[user.role],
              )}
            >
              {user.role.replaceAll("_", " ")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">{user.name}</p>
              <p className="truncate text-sm text-slate-400">{user.email}</p>
            </div>
            <form action={logout}>
              <SubmitButton
                pendingLabel="Signing out..."
                className="w-full rounded-xl bg-violet-400 px-3 py-3 text-sm text-white hover:bg-violet-300"
              >
                Log out
              </SubmitButton>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="portal-surface portal-enter rounded-[2rem] p-5 [animation-delay:90ms] xl:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <span
                  className={cx(
                    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase",
                    roleStyles[user.role],
                  )}
                >
                  {user.role.replaceAll("_", " ")}
                </span>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                    {title}
                  </h2>
                  {description ? (
                    <p className="mt-1 max-w-3xl text-base leading-7 text-slate-300">
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 lg:hidden">
                  {navigation.map((item) => {
                    const isActive =
                      currentPath === item.href ||
                      currentPath.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cx(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          isActive
                            ? "border-violet-300/30 bg-violet-400/15 text-violet-50"
                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.name}
                    </p>
                    <p className="truncate text-sm text-slate-400">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <span className="inline-flex items-center rounded-full border border-violet-300/15 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-100">
                      PH time
                    </span>
                    <Link
                      href="/profile"
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-100 transition duration-500 hover:-translate-y-0.5 hover:bg-white/[0.07]"
                    >
                      Profile
                    </Link>
                    <form action={logout} className="lg:hidden">
                      <SubmitButton
                        pendingLabel="Signing out..."
                        className="rounded-full bg-violet-400 px-3 py-1.5 text-xs text-white hover:bg-violet-300"
                      >
                        Log out
                      </SubmitButton>
                    </form>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="portal-enter flex-1 [animation-delay:180ms]">{children}</main>
        </div>
      </div>
    </div>
  );
}
