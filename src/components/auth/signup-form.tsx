"use client";

import { UserPlus } from "lucide-react";
import { useActionState } from "react";

import { signup, type SignupActionState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState: SignupActionState = {};

export function SignupForm() {
  const [state, action] = useActionState(signup, initialState);

  return (
    <form
      action={action}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400"
          placeholder="Full name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400"
          placeholder="student@csdept.edu"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-200"
          htmlFor="studentNumber"
        >
          Student number
        </label>
        <input
          id="studentNumber"
          name="studentNumber"
          required
          minLength={5}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400"
          placeholder="2024-00001"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-200"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            placeholder="Password"
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
            required
            minLength={8}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            placeholder="Re-enter password"
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-[1.2rem] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {state.error}
        </p>
      ) : null}

      <SubmitButton
        pendingLabel="Creating account..."
        className="w-full py-2.5 text-base"
      >
        <UserPlus size={17} />
        Create student account
      </SubmitButton>
    </form>
  );
}
