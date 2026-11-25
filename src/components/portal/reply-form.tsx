import { ConcernStatus } from "@prisma/client";
import { CircleCheck, RotateCcw, Send } from "lucide-react";

import { replyToConcern, updateConcernStatus } from "@/app/actions/concerns";
import { SubmitButton } from "@/components/forms/submit-button";

/** Staff composer: reply and choose what state the concern should be in afterwards. */
export function StaffReplyForm({
  concernId,
  currentStatus,
}: {
  concernId: string;
  currentStatus: ConcernStatus;
}) {
  const action = replyToConcern.bind(null, concernId);
  const defaultStatus =
    currentStatus === ConcernStatus.CLOSED ? ConcernStatus.CLOSED : ConcernStatus.ANSWERED;

  return (
    <form action={action} className="card card-pad space-y-3">
      <div className="field">
        <label className="label" htmlFor="reply-message">
          Reply to student
        </label>
        <textarea
          id="reply-message"
          name="message"
          required
          minLength={10}
          rows={5}
          className="input resize-y"
          placeholder="Write a clear next step for the student…"
        />
        <p className="hint">At least 10 characters. The student sees this reply on their concern page.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="field sm:w-64">
          <label className="label" htmlFor="reply-status">
            After sending
          </label>
          <select id="reply-status" name="status" defaultValue={defaultStatus} className="input">
            <option value="ANSWERED">Mark answered (waiting on student)</option>
            <option value="OPEN">Keep in “Needs reply”</option>
            <option value="CLOSED">Close the concern</option>
          </select>
        </div>
        <SubmitButton pendingLabel="Sending…">
          <Send size={16} />
          Send reply
        </SubmitButton>
      </div>
    </form>
  );
}

/** Student composer: follow up on an open thread. */
export function StudentFollowUpForm({ concernId }: { concernId: string }) {
  const action = replyToConcern.bind(null, concernId);

  return (
    <form action={action} className="card card-pad space-y-3">
      <div className="field">
        <label className="label" htmlFor="follow-up-message">
          Add a follow-up
        </label>
        <textarea
          id="follow-up-message"
          name="message"
          required
          minLength={5}
          rows={4}
          className="input resize-y"
          placeholder="Answer a question from staff, or add details…"
        />
        <p className="hint">Sending a follow-up puts your concern back in the staff queue.</p>
      </div>
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Sending…">
          <Send size={16} />
          Send follow-up
        </SubmitButton>
      </div>
    </form>
  );
}

/** Close / reopen without writing a message. */
export function ConcernStatusButton({
  concernId,
  nextStatus,
  label,
  variant = "secondary",
  className,
}: {
  concernId: string;
  nextStatus: "OPEN" | "CLOSED";
  label: string;
  variant?: "secondary" | "ghost" | "primary";
  className?: string;
}) {
  const action = updateConcernStatus.bind(null, concernId);
  const Icon = nextStatus === "CLOSED" ? CircleCheck : RotateCcw;

  return (
    <form action={action}>
      <input type="hidden" name="status" value={nextStatus} />
      <SubmitButton variant={variant} pendingLabel="Saving…" className={className}>
        <Icon size={16} />
        {label}
      </SubmitButton>
    </form>
  );
}
