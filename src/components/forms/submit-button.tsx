"use client";

import { Loader2 } from "lucide-react";
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
        "inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(14,165,233,0.95)] transition hover:bg-sky-400 active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 disabled:shadow-none",
        className,
      )}
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
