"use client";

import { useFormStatus } from "react-dom";

import { cx } from "@/lib/cx";

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  confirmMessage: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  className?: string;
};

/** A submit button that asks for confirmation before running a destructive action. */
export function ConfirmSubmitButton({
  children,
  confirmMessage,
  formAction,
  className,
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={cx("btn-danger", className)}
    >
      {children}
    </button>
  );
}
