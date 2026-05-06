"use client";

import { useActionState } from "react";

import { login, type LoginActionState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, action] = useActionState(login, initialState);

  return (
    <form
      action={action}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400 focus:bg-slate-950"
          placeholder="name@csdept.edu"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400 focus:bg-slate-950"
          placeholder="Enter your password"
        />
      </div>

      {state.error ? (
        <p className="rounded-[1.2rem] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {state.error}
        </p>
      ) : null}

      <SubmitButton
        pendingLabel="Signing in..."
        className="w-full rounded-xl py-2.5 text-base"
      >
        Sign in
      </SubmitButton>
    </form>
  );
}
