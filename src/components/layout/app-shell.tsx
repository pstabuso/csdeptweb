"use client";

import { Role } from "@prisma/client";
import {
  CalendarDays,
  ClipboardList,
  GraduationCap,
  History,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  PenLine,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";
import { SidebarClock } from "@/components/layout/sidebar-clock";
import { cx } from "@/lib/cx";

type AppShellProps = {
  user: {
    name: string;
    email: string;
    role: Role;
  };
  title: string;
  description?: string;
  /** Optional link shown above the title, e.g. "← Back to queue". */
  backLink?: { href: string; label: string };
  /** Buttons shown on the right of the page header. */
  actions?: React.ReactNode;
  /** @deprecated The shell now reads the pathname itself. */
  currentPath?: string;
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
};

const roleMeta: Record<Role, { label: string; focus: string; icon: NavItem["icon"] }> = {
  STUDENT: { label: "Student", focus: "Concerns and schedule", icon: GraduationCap },
  COORDINATOR: {
    label: "Coordinator",
    focus: "Thesis, grades, readmission",
    icon: ClipboardList,
  },
  SECRETARY: {
    label: "Secretary",
    focus: "COR revisions, general, calendar",
    icon: Inbox,
  },
  ADMIN: { label: "Admin", focus: "Accounts and oversight", icon: ShieldCheck },
};

function getNavigation(role: Role): NavItem[] {
  const profile: NavItem = { label: "Profile", href: "/profile", icon: UserRound };

  switch (role) {
    case Role.STUDENT:
      return [
        { label: "Overview", href: "/student", icon: LayoutDashboard },
        { label: "My concerns", href: "/student/concerns", icon: Inbox },
        { label: "New concern", href: "/student/concerns/new", icon: PenLine },
        { label: "Calendar", href: "/student/calendar", icon: CalendarDays },
        profile,
      ];
    case Role.ADMIN:
      return [
        { label: "Overview", href: "/admin", icon: LayoutDashboard },
        { label: "Users", href: "/admin/users", icon: UsersRound },
        { label: "Concerns", href: "/admin/concerns", icon: Inbox },
        { label: "Calendar", href: "/admin/calendar", icon: CalendarDays },
        { label: "Activity log", href: "/admin/activity", icon: History },
        profile,
      ];
    case Role.COORDINATOR:
    case Role.SECRETARY: {
      const base = role === Role.COORDINATOR ? "/coordinator" : "/secretary";
      return [
        { label: "Concern queue", href: base, icon: Inbox },
        { label: "Calendar", href: `${base}/calendar`, icon: CalendarDays },
        profile,
      ];
    }
    default:
      return [profile];
  }
}

/** The active item is the one whose href is the longest prefix of the path. */
function getActiveHref(items: NavItem[], pathname: string) {
  return items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;
}

function Sidebar({
  user,
  pathname,
  onNavigate,
}: {
  user: AppShellProps["user"];
  pathname: string;
  onNavigate?: () => void;
}) {
  const navigation = getNavigation(user.role);
  const activeHref = getActiveHref(navigation, pathname);
  const meta = roleMeta[user.role];
  const RoleIcon = meta.icon;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500 text-sm font-bold text-white">
            CS
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">CS Department</span>
            <span className="block text-xs text-ink-faint">Support portal</span>
          </span>
        </Link>
        {onNavigate ? (
          <button
            onClick={onNavigate}
            className="btn-ghost btn-sm lg:hidden"
            aria-label="Close menu"
            type="button"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className="px-3 pt-4">
        <div className="flex items-center gap-3 rounded-lg border border-line bg-canvas/60 px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-500/15 text-violet-200">
            <RoleIcon size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{meta.label}</p>
            <p className="truncate text-xs text-ink-faint">{meta.focus}</p>
          </div>
        </div>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === activeHref;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-violet-500/15 text-violet-50"
                  : "text-ink-muted hover:bg-white/[0.05] hover:text-ink",
              )}
            >
              <Icon size={17} className={isActive ? "text-violet-300" : undefined} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-line px-3 py-4">
        <p className="px-2 text-xs text-ink-faint">
          <SidebarClock /> · PH time
        </p>
        <div className="flex items-center gap-3 px-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-raised text-sm font-semibold text-ink">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-faint">{user.email}</p>
          </div>
          <form action={logout}>
            <SubmitButton
              variant="ghost"
              pendingLabel=""
              className="btn-sm"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  user,
  title,
  description,
  backLink,
  actions,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-surface lg:block">
        <Sidebar user={user} pathname={pathname} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            className="animate-fade-in absolute inset-0 w-full bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            type="button"
          />
          <aside className="animate-slide-in-left absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-surface">
            <Sidebar
              user={user}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="btn-secondary btn-sm"
            aria-label="Open menu"
            type="button"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold">CS Department</span>
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              {backLink ? (
                <Link
                  href={backLink.href}
                  className="mb-2 inline-flex text-sm text-ink-muted hover:text-ink"
                >
                  ← {backLink.label}
                </Link>
              ) : null}
              <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
              {description ? <p className="muted mt-1 max-w-2xl">{description}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
          </header>

          <main className="animate-enter">{children}</main>
        </div>
      </div>
    </div>
  );
}
