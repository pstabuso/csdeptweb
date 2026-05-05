import { createConcern } from "@/app/actions/concerns";
import { SubmitButton } from "@/components/forms/submit-button";

export function StudentConcernForm() {
  return (
    <form
      action={createConcern}
      className="space-y-4 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.4)]"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-950">
          Submit a new concern
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Share your question, request, or issue so the department team can
          respond.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="subject">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          required
          minLength={5}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
          placeholder="Example: Clearance concern"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="category">
          Category
        </label>
        <input
          id="category"
          name="category"
          required
          minLength={3}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
          placeholder="Admissions, Laboratory, Scheduling, Clearance..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="message">
          Concern details
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={15}
          rows={6}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
          placeholder="Explain the concern and include any important context."
        />
      </div>

      <SubmitButton pendingLabel="Sending concern...">Send concern</SubmitButton>
    </form>
  );
}

