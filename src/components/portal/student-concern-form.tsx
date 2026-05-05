import { createConcern } from "@/app/actions/concerns";
import { SubmitButton } from "@/components/forms/submit-button";

export function StudentConcernForm() {
  return (
    <form
      action={createConcern}
      className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white">
          Submit a new concern
        </h2>
        <p className="text-sm leading-6 text-slate-300">
          Share your question, request, or issue so the department team can
          respond.
        </p>
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
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:bg-slate-950"
          placeholder="Example: Clearance concern"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="category">
          Category
        </label>
        <input
          id="category"
          name="category"
          required
          minLength={3}
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:bg-slate-950"
          placeholder="Admissions, Laboratory, Scheduling, Clearance..."
        />
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
          rows={6}
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:bg-slate-950"
          placeholder="Explain the concern and include any important context."
        />
      </div>

      <SubmitButton pendingLabel="Sending concern...">Send concern</SubmitButton>
    </form>
  );
}
