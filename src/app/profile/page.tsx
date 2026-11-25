import { Save } from "lucide-react";

import { updateProfile } from "@/app/actions/profile";
import { SubmitButton } from "@/components/forms/submit-button";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { cx } from "@/lib/cx";
import { formatDate, formatRoleLabel } from "@/lib/format";

type PageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

const statusMessages: Record<string, { tone: "success" | "error"; text: string }> = {
  saved: { tone: "success", text: "Profile updated." },
  password: { tone: "error", text: "Your current password didn't match. Nothing was changed." },
  invalid: { tone: "error", text: "Check the form: new passwords need 8+ characters and must match." },
};

export default async function ProfilePage({ searchParams }: PageProps) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const message = params.status ? statusMessages[params.status] : undefined;

  return (
    <AppShell user={user} title="Profile" description="Your account details and password.">
      <div className="max-w-2xl space-y-4">
        {message ? (
          <div
            role={message.tone === "error" ? "alert" : "status"}
            className={cx(
              "rounded-lg border px-4 py-3 text-sm",
              message.tone === "error"
                ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
                : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
            )}
          >
            {message.text}
          </div>
        ) : null}

        <section className="card card-pad">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-ink-muted">Role</dt>
              <dd className="mt-1 font-medium text-ink">{formatRoleLabel(user.role)}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-ink-muted">Email</dt>
              <dd className="mt-1 truncate font-medium text-ink">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">
                {user.studentNumber ? "Student number" : "Member since"}
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {user.studentNumber || formatDate(user.createdAt)}
              </dd>
            </div>
          </dl>
          <p className="hint mt-4">To change your email or student number, contact the department admin.</p>
        </section>

        <form action={updateProfile} className="card card-pad space-y-5">
          <div className="field">
            <label className="label" htmlFor="name">
              Display name
            </label>
            <input
              id="name"
              name="name"
              defaultValue={user.name}
              required
              minLength={2}
              className="input"
            />
          </div>

          <fieldset className="space-y-3 border-t border-line pt-5">
            <legend className="sr-only">Change password</legend>
            <div>
              <p className="font-medium text-ink">Change password</p>
              <p className="hint">Leave blank to keep your current password. Changing it signs out other sessions.</p>
            </div>
            <div className="field">
              <label className="label" htmlFor="currentPassword">
                Current password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                className="input"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="field">
                <label className="label" htmlFor="password">
                  New password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  className="input"
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="confirmPassword">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  className="input"
                />
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end">
            <SubmitButton pendingLabel="Saving…">
              <Save size={16} />
              Save changes
            </SubmitButton>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
