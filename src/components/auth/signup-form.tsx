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
      className="space-y-5 rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Create a student account
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Students can create their own portal access here. Coordinator,
          secretary, and admin accounts should still be created by the department.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        New sign-ups are registered as <span className="font-semibold">Student</span>.
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
          placeholder="Enter your full name"
        />
      </div>

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
          placeholder="student@csdept.edu"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-700"
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
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="At least 8 characters"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-700"
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
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
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

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-sky-700 hover:text-sky-800" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
