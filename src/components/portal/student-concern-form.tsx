import { Send } from "lucide-react";

import { createConcern } from "@/app/actions/concerns";
import { SubmitButton } from "@/components/forms/submit-button";
import { STUDENT_CONCERN_CATEGORIES } from "@/lib/constants";

type StudentConcernFormProps = {
  redirectTo?: string;
};

export function StudentConcernForm({
  redirectTo = "/student",
}: StudentConcernFormProps) {
  return (
    <form
      id="new-concern"
      action={createConcern}
      className="animate-enter scroll-mt-5 space-y-4 rounded-lg border border-slate-800 bg-slate-900/88 p-5 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.95)]"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-200/80">
          New concern
        </p>
        <h2 className="text-xl font-semibold text-white">Submit request</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="category">
            Concern type
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400 focus:bg-slate-950"
            defaultValue=""
          >
            <option value="" disabled>
              Choose type
            </option>
            {STUDENT_CONCERN_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="subject">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            required
            minLength={5}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400 focus:bg-slate-950"
            placeholder="Short summary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="message">
          Details
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={15}
          rows={5}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400 focus:bg-slate-950"
          placeholder="Explain the request or concern"
        />
      </div>

      <SubmitButton pendingLabel="Sending concern...">
        <Send size={16} />
        Send concern
      </SubmitButton>
    </form>
  );
}
