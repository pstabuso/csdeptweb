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
      <div className="field">
        <label className="label" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          className="input"
          placeholder="Full name"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="student@csdept.edu"
        />
      </div>

      <div className="field">
        <label
          className="label"
          htmlFor="studentNumber"
        >
          Student number
        </label>
        <input
          id="studentNumber"
          name="studentNumber"
          required
          minLength={5}
          className="input"
          placeholder="2024-00001"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label
            className="label"
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
            className="input"
            placeholder="Password"
            autoComplete="new-password"
          />
        </div>

        <div className="field">
          <label
            className="label"
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
            className="input"
            placeholder="Re-enter password"
            autoComplete="new-password"
          />
        </div>
        <p className="hint sm:col-span-2">At least 8 characters, with a letter and a number.</p>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {state.error}
        </p>
      ) : null}

      <SubmitButton
        pendingLabel="Creating account..."
        className="w-full"
      >
        <UserPlus size={17} />
        Create student account
      </SubmitButton>
    </form>
  );
}
