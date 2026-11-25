"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { cx } from "@/lib/cx";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  formAction?: (formData: FormData) => void | Promise<void>;
  name?: string;
  value?: string;
  "aria-label"?: string;
};

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

export function SubmitButton({
  children,
  pendingLabel = "Saving...",
  className,
  variant = "primary",
  formAction,
  name,
  value,
  "aria-label": ariaLabel,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={cx(variants[variant], className)}
      disabled={pending}
      formAction={formAction}
      name={name}
      value={value}
      aria-label={ariaLabel}
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
