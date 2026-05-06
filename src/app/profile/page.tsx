import { AppShell } from "@/components/layout/app-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { updateProfile } from "@/app/actions/profile";
import { requireUser } from "@/lib/auth";
import { formatRoleLabel } from "@/lib/format";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <AppShell user={user} title="Profile settings">
      <section className="mx-auto max-w-3xl space-y-4">
        <article className="rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-4 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.1rem] border border-white/10 bg-slate-900/80 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Role
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatRoleLabel(user.role)}
              </p>
            </div>
            <div className="rounded-[1.1rem] border border-white/10 bg-slate-900/80 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Email
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{user.email}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/10 bg-slate-900/80 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Student number
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {user.studentNumber || "Not assigned"}
              </p>
            </div>
          </div>
        </article>

        <form
          action={updateProfile}
          className="space-y-4 rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur"
        >
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Account</h2>
            <p className="text-sm text-slate-400">Leave password blank to keep it.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="name">
              Username
            </label>
            <input
              id="name"
              name="name"
              defaultValue={user.name}
              required
              minLength={2}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="password"
              >
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="confirmPassword"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={8}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          <SubmitButton pendingLabel="Saving profile...">
            Save profile
          </SubmitButton>
        </form>
      </section>
    </AppShell>
  );
}
