import { AppShell } from "@/components/layout/app-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { updateProfile } from "@/app/actions/profile";
import { requireUser } from "@/lib/auth";
import { formatRoleLabel } from "@/lib/format";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <AppShell
      user={user}
      title="Profile settings"
      description="Update your display name and password from one profile page. Changes apply to your current account immediately after saving."
    >
      <section className="mx-auto max-w-3xl space-y-6">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Role
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatRoleLabel(user.role)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Email
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{user.email}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-4">
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
          className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-white">
              Edit username and password
            </h2>
            <p className="text-sm leading-6 text-slate-300">
              Leave the password fields blank if you only want to update your
              username.
            </p>
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
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
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
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                placeholder="Leave blank to keep current password"
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
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
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
