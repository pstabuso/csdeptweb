import { ConcernStatus } from "@prisma/client";

import { replyToConcern } from "@/app/actions/concerns";
import { SubmitButton } from "@/components/forms/submit-button";

type ReplyFormProps = {
  concernId: string;
  defaultStatus: ConcernStatus;
  redirectTo: string;
};

export function ReplyForm({
  concernId,
  defaultStatus,
  redirectTo,
}: ReplyFormProps) {
  const action = replyToConcern.bind(null, concernId);

  return (
    <form
      action={action}
      className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-200"
            htmlFor={`reply-${concernId}`}
          >
            Staff reply
          </label>
          <textarea
            id={`reply-${concernId}`}
            name="message"
            required
            minLength={10}
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
            placeholder="Write a clear and helpful response for the student."
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-200"
            htmlFor={`status-${concernId}`}
          >
            Concern status
          </label>
          <select
            id={`status-${concernId}`}
            name="status"
            defaultValue={defaultStatus}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
          >
            <option value="OPEN">Open</option>
            <option value="ANSWERED">Answered</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>
      <SubmitButton pendingLabel="Saving reply...">Send reply</SubmitButton>
    </form>
  );
}
