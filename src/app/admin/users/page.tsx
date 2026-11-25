import { Role, UserStatus } from "@prisma/client";
import { Save, Search } from "lucide-react";
import Link from "next/link";

import { updateUserAccess } from "@/app/actions/admin";
import { SubmitButton } from "@/components/forms/submit-button";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, LinkTabs, Notice } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { cx } from "@/lib/cx";
import { getAdminUsers } from "@/lib/dashboard-data";
import { formatDate, formatRelative, formatRoleLabel } from "@/lib/format";
import { buildHref } from "@/lib/href";

type PageProps = {
  searchParams?: Promise<{ query?: string; role?: string; notice?: string }>;
};

const ROLE_FILTERS: Array<{ label: string; value: Role | "ALL" }> = [
  { label: "Everyone", value: "ALL" },
  { label: "Students", value: Role.STUDENT },
  { label: "Coordinators", value: Role.COORDINATOR },
  { label: "Secretaries", value: Role.SECRETARY },
  { label: "Admins", value: Role.ADMIN },
];

function normalizeRole(value?: string): Role | "ALL" {
  return (Object.values(Role) as string[]).includes(value ?? "") ? (value as Role) : "ALL";
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const admin = await requireUser([Role.ADMIN]);
  const params = (await searchParams) ?? {};
  const query = params.query?.trim() ?? "";
  const role = normalizeRole(params.role);
  const users = await getAdminUsers({ query, role });
  const currentHref = buildHref("/admin/users", {
    query: query || undefined,
    role: role !== "ALL" ? role : undefined,
  });

  return (
    <AppShell user={admin} title="Users" description="Edit names, roles and access. Role or email changes sign the person out.">
      <div className="space-y-4">
        <Notice code={params.notice} />

        <div className="card card-pad space-y-3">
          <LinkTabs
            label="Filter by role"
            tabs={ROLE_FILTERS.map((filter) => ({
              label: filter.label,
              href: buildHref("/admin/users", {
                query: query || undefined,
                role: filter.value !== "ALL" ? filter.value : undefined,
              }),
              active: role === filter.value,
            }))}
          />
          <form action="/admin/users" className="flex gap-2">
            {role !== "ALL" ? <input type="hidden" name="role" value={role} /> : null}
            <label className="relative flex-1">
              <span className="sr-only">Search users</span>
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                name="query"
                type="search"
                defaultValue={query}
                placeholder="Search name, email or student number"
                className="input pl-9"
              />
            </label>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
        </div>

        {users.length ? (
          <ul className="card divide-y divide-line">
            {users.map((account) => {
              const action = updateUserAccess.bind(null, account.id);
              const isSelf = account.id === admin.id;
              const isDisabled = account.status === UserStatus.DISABLED;

              return (
                <li key={account.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none flex-col gap-2 px-4 py-3.5 hover:bg-raised sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                      <span
                        className={cx(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-raised text-sm font-semibold",
                          isDisabled && "opacity-50",
                        )}
                      >
                        {account.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cx("font-medium", isDisabled ? "text-ink-muted line-through" : "text-ink")}>
                            {account.name}
                          </span>
                          <span className="chip">{formatRoleLabel(account.role)}</span>
                          {isDisabled ? (
                            <span className="chip border-rose-400/30 text-rose-200">Disabled</span>
                          ) : null}
                          {account.lockedUntil && account.lockedUntil > new Date() ? (
                            <span className="chip border-amber-400/30 text-amber-200">Locked</span>
                          ) : null}
                          {isSelf ? <span className="chip-accent">You</span> : null}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-ink-muted">
                          {account.email}
                          {account.studentNumber ? ` · ${account.studentNumber}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-xs text-ink-faint sm:text-right">
                        <p>
                          {account.lastLoginAt
                            ? `Last sign-in ${formatRelative(account.lastLoginAt)}`
                            : "Never signed in"}
                        </p>
                        <p>
                          {account.role === Role.STUDENT
                            ? `${account._count.concerns} concerns`
                            : `${account._count.replies} replies`}{" "}
                          · joined {formatDate(account.createdAt)}
                        </p>
                      </div>
                    </summary>

                    <form action={action} className="grid gap-3 border-t border-line bg-canvas/40 p-4 sm:px-5 md:grid-cols-2">
                      <input type="hidden" name="redirectTo" value={currentHref} />
                      {isSelf ? (
                        <>
                          <input type="hidden" name="role" value={account.role} />
                          <input type="hidden" name="status" value={account.status} />
                        </>
                      ) : null}
                      <div className="field">
                        <label className="label" htmlFor={`name-${account.id}`}>
                          Full name
                        </label>
                        <input id={`name-${account.id}`} name="name" defaultValue={account.name} required className="input" />
                      </div>
                      <div className="field">
                        <label className="label" htmlFor={`email-${account.id}`}>
                          Email
                        </label>
                        <input
                          id={`email-${account.id}`}
                          name="email"
                          type="email"
                          defaultValue={account.email}
                          required
                          className="input"
                        />
                      </div>
                      <div className="field">
                        <label className="label" htmlFor={`student-number-${account.id}`}>
                          Student number
                        </label>
                        <input
                          id={`student-number-${account.id}`}
                          name="studentNumber"
                          defaultValue={account.studentNumber ?? ""}
                          className="input"
                          placeholder="Students only"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="field">
                          <label className="label" htmlFor={`role-${account.id}`}>
                            Role
                          </label>
                          <select
                            id={`role-${account.id}`}
                            name={isSelf ? undefined : "role"}
                            defaultValue={account.role}
                            disabled={isSelf}
                            className="input"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="COORDINATOR">Coordinator</option>
                            <option value="SECRETARY">Secretary</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                        <div className="field">
                          <label className="label" htmlFor={`status-${account.id}`}>
                            Access
                          </label>
                          <select
                            id={`status-${account.id}`}
                            name={isSelf ? undefined : "status"}
                            defaultValue={account.status}
                            disabled={isSelf}
                            className="input"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="DISABLED">Disabled</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
                        <p className="hint">
                          {isSelf
                            ? "You can't change your own role or access."
                            : account.failedLoginAttempts
                              ? `${account.failedLoginAttempts} failed sign-in attempts.`
                              : ""}
                        </p>
                        <SubmitButton pendingLabel="Saving…">
                          <Save size={15} />
                          Save account
                        </SubmitButton>
                      </div>
                    </form>
                  </details>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="No users match"
            action={
              <Link href="/admin/users" className="btn-secondary">
                Clear filters
              </Link>
            }
          />
        )}
      </div>
    </AppShell>
  );
}
