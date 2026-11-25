"use client";

import { LogIn } from "lucide-react";
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
          placeholder="name@csdept.edu"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="input"
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {state.error}
        </p>
      ) : null}

      <SubmitButton
        pendingLabel="Signing in..."
        className="w-full"
      >
        <LogIn size={17} />
        Sign in
      </SubmitButton>
    </form>
  );
}
