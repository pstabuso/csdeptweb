"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signup, type SignupActionState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState: SignupActionState = {};

export function SignupForm() {
  const [state, action] = useActionState(signup, initialState);

  return (
    <form
      action={action}
      className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur-xl"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Create a student account
        </h2>
        <p className="text-sm leading-6 text-slate-300">
          Students can create their own portal access here. Coordinator,
          secretary, and admin accounts should still be created by the department.
        </p>
      </div>

      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
        New sign-ups are registered as <span className="font-semibold">Student</span>.
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:bg-slate-950"
          placeholder="Enter your full name"
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
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:bg-slate-950"
          placeholder="student@csdept.edu"
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
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:bg-slate-950"
            placeholder="At least 8 characters"
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
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:bg-slate-950"
            placeholder="Re-enter password"
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton
        pendingLabel="Creating account..."
        className="w-full rounded-2xl py-3 text-base"
      >
        Create student account
      </SubmitButton>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link className="font-semibold text-emerald-300 hover:text-emerald-200" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
