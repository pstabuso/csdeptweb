"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login, type LoginActionState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, action] = useActionState(login, initialState);

  return (
    <form
      action={action}
      className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur-xl"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Department portal login
        </h2>
        <p className="text-sm leading-6 text-slate-300">
          Sign in with your assigned email and password. Access is determined by
          the role granted to your account by the admin.
        </p>
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
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:bg-slate-950"
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
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:bg-slate-950"
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

      <p className="text-center text-sm text-slate-400">
        Need an account?{" "}
        <Link
          className="font-semibold text-cyan-300 hover:text-cyan-200"
          href="/sign-up"
        >
          Student sign up
        </Link>
      </p>
    </form>
  );
}
