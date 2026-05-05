"use client";

import { useActionState } from "react";

import { login, type LoginActionState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";
import { cx } from "@/lib/cx";

const initialState: LoginActionState = {};
const roleOptions = [
  {
    value: "STUDENT",
    label: "Student",
    helper: "Submit concerns and monitor replies.",
  },
  {
    value: "COORDINATOR",
    label: "Coordinator",
    helper: "Review and respond to student concerns.",
  },
  {
    value: "SECRETARY",
    label: "Secretary",
    helper: "Manage queue updates and student follow-ups.",
  },
  {
    value: "ADMIN",
    label: "Admin",
    helper: "View all activity across the portal.",
  },
] as const;

export function LoginForm() {
  const [state, action] = useActionState(login, initialState);

  return (
    <form
      action={action}
      className="space-y-5 rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Department portal login
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Sign in with your assigned email, password, and role to access the
          correct portal view.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">
          Sign in as
        </legend>
        <div className="grid gap-3">
          {roleOptions.map((role, index) => (
            <label
              key={role.value}
              className={cx(
                "flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50",
              )}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                defaultChecked={index === 0}
                className="mt-1 h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="block">
                <span className="block font-semibold text-slate-900">
                  {role.label}
                </span>
                <span className="mt-1 block text-slate-500">{role.helper}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
          placeholder="name@csdept.edu"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
          placeholder="Enter your password"
        />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton
        pendingLabel="Signing in..."
        className="w-full rounded-2xl py-3 text-base"
      >
        Sign in
      </SubmitButton>
    </form>
  );
}
