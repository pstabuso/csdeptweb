"use client";

import { useFormStatus } from "react-dom";

import { cx } from "@/lib/cx";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
};

export function SubmitButton({
  children,
  pendingLabel = "Saving...",
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={cx(
        "inline-flex items-center justify-center rounded-2xl bg-violet-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300",
        className,
      )}
      disabled={pending}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
