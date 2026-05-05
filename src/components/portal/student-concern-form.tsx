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
      action={createConcern}
      className="space-y-3 rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-4 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-white">New concern</h2>
        <p className="text-sm text-slate-400">Pick a type, add details.</p>
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
          placeholder="Subject"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400 focus:bg-slate-950"
          defaultValue=""
        >
          <option value="" disabled>
            Choose concern type
          </option>
          {STUDENT_CONCERN_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="message">
          Concern details
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={15}
          rows={5}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400 focus:bg-slate-950"
          placeholder="Details"
        />
      </div>

      <SubmitButton pendingLabel="Sending concern...">Send concern</SubmitButton>
    </form>
  );
}
