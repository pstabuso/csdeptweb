"use client";

import { Role } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

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
  STUDENT:
    "border-sky-500/30 bg-sky-500/12 text-sky-200 shadow-[0_0_24px_rgba(56,189,248,0.15)]",
  COORDINATOR:
    "border-fuchsia-500/30 bg-fuchsia-500/12 text-fuchsia-200 shadow-[0_0_24px_rgba(217,70,239,0.15)]",
  SECRETARY:
    "border-violet-500/30 bg-violet-500/12 text-violet-200 shadow-[0_0_24px_rgba(139,92,246,0.15)]",
  ADMIN:
    "border-pink-500/30 bg-pink-500/12 text-pink-200 shadow-[0_0_24px_rgba(236,72,153,0.15)]",
};

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx("h-3.5 w-3.5 transition-transform duration-300", collapsed ? "rotate-180" : "")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SidebarContent({
  user,
  currentPath,
  collapsed,
  onCloseMobile,
}: {
  user: AppShellProps["user"];
  currentPath: string;
  collapsed: boolean;
  onCloseMobile?: () => void;
}) {
  const navigation = getRoleNavigation(user.role);

  return (
    <>
      <div
        className={cx(
          "border-b border-slate-800/90 px-4 py-4",
          collapsed ? "flex justify-center" : "flex items-start justify-between gap-3",
        )}
      >
        {collapsed ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/25 to-fuchsia-500/20 text-sm font-bold text-sky-200">
            CS
          </div>
        ) : (
          <>
            <div>
              <p className="text-xl font-bold tracking-tight text-sky-300">XoCS Dept</p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                Portal Workspace
              </p>
              <p className="mt-3 text-xs font-medium text-slate-400">
                <SidebarClock />
              </p>
            </div>

            {onCloseMobile ? (
              <button
                onClick={onCloseMobile}
                className="rounded-xl border border-slate-700 p-2 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-white lg:hidden"
                aria-label="Close sidebar"
              >
                <CloseIcon />
              </button>
            ) : null}
          </>
        )}
      </div>

      <div className={cx("flex-1 overflow-y-auto", collapsed ? "px-2 py-3" : "px-3 py-4")}>
        {!collapsed ? (
          <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Current role
            </p>
            <div
              className={cx(
                "mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]",
                roleStyles[user.role],
              )}
            >
              {user.role.replaceAll("_", " ")}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {user.role === Role.STUDENT
                ? "Track concerns, replies, and department availability."
                : user.role === Role.ADMIN
                  ? "Manage access, oversight, and operational flow."
                  : "Handle concerns quickly and keep posted availability current."}
            </p>
          </div>
        ) : null}

        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const isActive =
              currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            const badge = item.label
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={cx(
                  "group flex rounded-2xl border transition-all duration-300",
                  collapsed
                    ? "items-center justify-center px-0 py-3"
                    : "items-center gap-3 px-3.5 py-3.5",
                  isActive
                    ? "border-sky-500/30 bg-sky-500/12 text-sky-200 shadow-[0_0_18px_rgba(56,189,248,0.12)]"
                    : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white",
                )}
              >
                <span
                  className={cx(
                    "inline-flex shrink-0 items-center justify-center rounded-xl border text-[11px] font-bold uppercase tracking-[0.14em]",
                    collapsed ? "h-10 w-10" : "h-10 w-10",
                    isActive
                      ? "border-sky-500/30 bg-sky-500/15 text-sky-100"
                      : "border-slate-700 bg-slate-900 text-slate-300 group-hover:border-slate-600",
                  )}
                >
                  {badge}
                </span>

                {!collapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.label}</p>
                    <p className="truncate text-xs text-slate-500 group-hover:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className={cx(
          "border-t border-slate-800/90",
          collapsed ? "px-2 py-3" : "px-3 py-4",
        )}
      >
        <div className={cx("rounded-2xl border border-slate-800 bg-slate-900/85", collapsed ? "p-2" : "p-4")}>
          {collapsed ? (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-fuchsia-500 text-sm font-bold text-white">
                  {user.name.charAt(0)}
                </div>
              </div>
              <form action={logout}>
                <SubmitButton pendingLabel="..." className="w-full rounded-xl px-0 py-2 text-xs">
                  Out
                </SubmitButton>
              </form>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-fuchsia-500 text-sm font-bold text-white">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/profile"
                  onClick={onCloseMobile}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/75 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                >
                  Profile
                </Link>
                <form action={logout}>
                  <SubmitButton pendingLabel="Signing out..." className="w-full rounded-xl py-2.5">
                    Sign out
                  </SubmitButton>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function AppShell({
  user,
  title,
  description,
  currentPath,
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_22%),radial-gradient(circle_at_80%_0%,_rgba(217,70,239,0.12),_transparent_18%),linear-gradient(180deg,_#020617_0%,_#020617_60%,_#0f172a_100%)]" />

      <aside
        className={cx(
          "fixed left-0 top-0 z-40 hidden h-screen border-r border-slate-800 bg-slate-900 text-slate-300 shadow-[18px_0_60px_-45px_rgba(0,0,0,0.95)] transition-all duration-300 lg:flex lg:flex-col",
          collapsed ? "w-20" : "w-80",
        )}
      >
        <SidebarContent user={user} currentPath={currentPath} collapsed={collapsed} />

        <button
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-7 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-lg transition hover:border-slate-600 hover:text-white"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="animate-slide-in-left absolute left-0 top-0 h-full w-80 max-w-[86vw] border-r border-slate-800 bg-slate-900 text-slate-300 shadow-2xl">
            <SidebarContent
              user={user}
              currentPath={currentPath}
              collapsed={false}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div
        className={cx(
          "relative z-10 min-h-screen transition-[padding-left] duration-300 lg:pl-20",
          collapsed ? "lg:pl-20" : "lg:pl-80",
        )}
      >
        <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col gap-6 px-4 py-4 sm:px-5 xl:px-8">
          <header className="animate-enter rounded-[2rem] border border-slate-800 bg-slate-900/88 p-5 shadow-[0_20px_80px_-45px_rgba(0,0,0,0.95)] backdrop-blur-xl xl:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileOpen(true)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/80 hover:text-white lg:hidden"
                    aria-label="Open sidebar"
                  >
                    <MenuIcon />
                  </button>
                  <span
                    className={cx(
                      "inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]",
                      roleStyles[user.role],
                    )}
                  >
                    {user.role.replaceAll("_", " ")}
                  </span>
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                    {title}
                  </h1>
                  {description ? (
                    <p className="mt-2 max-w-4xl text-base leading-7 text-slate-400">
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Access
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    Role-controlled
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Timezone
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">Asia/Manila</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Session
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">Secured</p>
                </div>
              </div>
            </div>
          </header>

          <main className="animate-enter flex-1 [animation-delay:120ms]">{children}</main>
        </div>
      </div>
    </div>
  );
}
