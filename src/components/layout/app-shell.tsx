"use client";

import { Role } from "@prisma/client";
import {
  CalendarDays,
  Clock3,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Settings2,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
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

type SidebarLink = {
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
};

const roleStyles: Record<Role, string> = {
  STUDENT: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  COORDINATOR: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200",
  SECRETARY: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  ADMIN: "border-pink-500/30 bg-pink-500/10 text-pink-200",
};

const roleIcons: Record<Role, React.ComponentType<{ className?: string; size?: number }>> = {
  STUDENT: GraduationCap,
  COORDINATOR: Inbox,
  SECRETARY: CalendarDays,
  ADMIN: ShieldCheck,
};

function getRoleHome(role: Role) {
  if (role === Role.COORDINATOR) return "/coordinator";
  if (role === Role.SECRETARY) return "/secretary";
  if (role === Role.ADMIN) return "/admin";
  return "/student";
}

function getSectionLinks(role: Role, currentPath: string): SidebarLink[] {
  if (currentPath === "/profile") {
    return [
      {
        label: "Workspace",
        description: "Back to role home",
        href: getRoleHome(role),
        icon: LayoutDashboard,
      },
      {
        label: "Security",
        description: "Password and name",
        href: "/profile",
        icon: LockKeyhole,
      },
    ];
  }

  if (role === Role.ADMIN) {
    return [
      { label: "Overview", description: "System counters", href: "/admin#overview", icon: LayoutDashboard },
      { label: "Users", description: "Access editor", href: "/admin#users", icon: UsersRound },
      { label: "Concerns", description: "Full threads", href: "/admin#queue", icon: Inbox },
      { label: "Schedule", description: "Calendar view", href: "/admin#schedule", icon: CalendarDays },
    ];
  }

  if (role === Role.STUDENT) {
    return [
      { label: "Record", description: "Student number", href: "/student#record", icon: GraduationCap },
      { label: "Submit", description: "New concern", href: "/student#new-concern", icon: PenLine },
      { label: "Calendar", description: "Department schedule", href: "/student#schedule", icon: CalendarDays },
      { label: "Replies", description: "Active and closed", href: "/student#concerns", icon: Inbox },
    ];
  }

  const basePath = role === Role.COORDINATOR ? "/coordinator" : "/secretary";
  return [
    { label: "Queue", description: "Student concerns", href: `${basePath}#queue`, icon: Inbox },
    { label: "Calendar", description: "Availability editor", href: `${basePath}#schedule`, icon: CalendarDays },
    { label: "Profile", description: "Account settings", href: "/profile", icon: UserRound },
  ];
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
  const sectionLinks = getSectionLinks(user.role, currentPath);
  const RoleIcon = roleIcons[user.role];

  return (
    <>
      <div
        className={cx(
          "border-b border-slate-800 px-3 py-4",
          collapsed ? "flex justify-center" : "flex items-start justify-between gap-3",
        )}
      >
        <div className={cx("min-w-0", collapsed ? "hidden" : "block")}>
          <p className="text-lg font-bold text-sky-300">CS Dept</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Portal Workspace</p>
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-400">
            <Clock3 size={14} className="text-sky-400" />
            <SidebarClock />
          </p>
        </div>

        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-500/25 bg-sky-500/10 text-sm font-bold text-sky-200">
            CS
          </div>
        ) : null}

        {onCloseMobile ? (
          <button
            onClick={onCloseMobile}
            className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
            type="button"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className={cx("flex-1 overflow-y-auto", collapsed ? "px-2 py-3" : "px-3 py-4")}>
        <div className={cx("mb-4 rounded-lg border border-slate-800 bg-slate-950/60", collapsed ? "p-2" : "p-3")}>
          {collapsed ? (
            <div className="flex justify-center">
              <RoleIcon size={18} className="text-sky-300" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className={cx("flex h-10 w-10 items-center justify-center rounded-lg border", roleStyles[user.role])}>
                <RoleIcon size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user.role.replaceAll("_", " ")}
                </p>
                <p className="truncate text-xs text-slate-500">Active session</p>
              </div>
            </div>
          )}
        </div>

        <p className={cx("mb-2 px-1 text-[11px] font-semibold uppercase text-slate-600", collapsed ? "sr-only" : "")}>
          Navigation
        </p>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            const Icon = item.href === "/profile" ? UserRound : LayoutDashboard;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={cx(
                  "group flex rounded-lg border transition",
                  collapsed
                    ? "items-center justify-center px-0 py-3"
                    : "items-center gap-3 px-3 py-3",
                  isActive
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-200"
                    : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white",
                )}
              >
                <Icon size={18} className="shrink-0" />
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

        <p className={cx("mb-2 mt-5 px-1 text-[11px] font-semibold uppercase text-slate-600", collapsed ? "sr-only" : "")}>
          Sections
        </p>
        <nav className="space-y-1">
          {sectionLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={cx(
                  "group flex rounded-lg border border-transparent text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white",
                  collapsed ? "items-center justify-center px-0 py-3" : "items-center gap-3 px-3 py-3",
                )}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.label}</p>
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

      <div className={cx("border-t border-slate-800", collapsed ? "px-2 py-3" : "px-3 py-4")}>
        <div className={cx("rounded-lg border border-slate-800 bg-slate-950/60", collapsed ? "p-2" : "p-3")}>
          {collapsed ? (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-pink-500 text-sm font-bold text-white">
                  {user.name.charAt(0)}
                </div>
              </div>
              <form action={logout}>
                <SubmitButton pendingLabel="..." className="w-full rounded-lg px-0 py-2 text-xs">
                  <LogOut size={14} />
                </SubmitButton>
              </form>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-pink-500 text-sm font-bold text-white">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                <Link
                  href="/profile"
                  onClick={onCloseMobile}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/75 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                >
                  <Settings2 size={15} />
                  Profile
                </Link>
                <form action={logout}>
                  <SubmitButton
                    pendingLabel="..."
                    className="h-full rounded-lg px-3 py-2"
                  >
                    <LogOut size={15} />
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
      <aside
        className={cx(
          "fixed left-0 top-0 z-40 hidden h-screen border-r border-slate-800 bg-slate-900 text-slate-300 shadow-[18px_0_60px_-45px_rgba(0,0,0,0.95)] transition-all duration-300 lg:flex lg:flex-col",
          collapsed ? "w-20" : "w-80",
        )}
      >
        <SidebarContent user={user} currentPath={currentPath} collapsed={collapsed} />

        <button
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-6 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-lg transition hover:border-slate-600 hover:text-white"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          type="button"
        >
          {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 w-full bg-slate-950/75 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar overlay"
            type="button"
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
          "min-h-screen transition-[padding-left] duration-300",
          collapsed ? "lg:pl-20" : "lg:pl-80",
        )}
      >
        <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col gap-5 px-4 py-4 sm:px-5 xl:px-7">
          <header className="animate-enter rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-[0_20px_80px_-45px_rgba(0,0,0,0.95)] xl:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileOpen(true)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/80 hover:text-white lg:hidden"
                    aria-label="Open sidebar"
                    type="button"
                  >
                    <Menu size={18} />
                  </button>
                  <span
                    className={cx(
                      "inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]",
                      roleStyles[user.role],
                    )}
                  >
                    {user.role.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
                  {description ? (
                    <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[390px]">
                <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase text-slate-500">
                    Access
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">Role</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase text-slate-500">
                    Time
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">PH</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase text-slate-500">
                    Session
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">Active</p>
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
