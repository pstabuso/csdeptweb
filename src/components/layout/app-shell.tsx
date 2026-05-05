import { Role } from "@prisma/client";

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
  STUDENT: "bg-sky-100 text-sky-900",
  COORDINATOR: "bg-emerald-100 text-emerald-900",
  SECRETARY: "bg-amber-100 text-amber-900",
  ADMIN: "bg-rose-100 text-rose-900",
};

export function AppShell({
  user,
  title,
  description,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_50%,_#f7fbf7_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="mb-8 rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
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
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                  {title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                  {description}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user.name}
                </p>
                <p className="truncate text-sm text-slate-500">{user.email}</p>
              </div>
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
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

