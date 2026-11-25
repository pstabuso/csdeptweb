import { Send } from "lucide-react";

import { createConcern } from "@/app/actions/concerns";
import { SubmitButton } from "@/components/forms/submit-button";
import { STAFF_CATEGORY_OWNERSHIP, STUDENT_CONCERN_CATEGORIES } from "@/lib/constants";

export function StudentConcernForm() {
  return (
    <form action={createConcern} className="card card-pad space-y-5">
      <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
        <div className="field">
          <label className="label" htmlFor="category">
            Concern type
          </label>
          <select id="category" name="category" required className="input" defaultValue="">
            <option value="" disabled>
              Choose a type
            </option>
            {STUDENT_CONCERN_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="subject">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            required
            minLength={5}
            maxLength={140}
            className="input"
            placeholder="e.g. Request to complete INC in CS 101"
          />
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="message">
          Details
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={15}
          rows={7}
          className="input resize-y"
          placeholder="Explain what you need, include course codes, sections, and dates where relevant."
        />
        <p className="hint">At least 15 characters. You can add follow-ups after submitting.</p>
      </div>

      <div className="flex flex-col gap-4 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <dl className="grid gap-1 text-xs text-ink-faint">
          <div>
            <dt className="inline font-medium text-ink-muted">Coordinator handles: </dt>
            <dd className="inline">{STAFF_CATEGORY_OWNERSHIP.COORDINATOR.join(", ")}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-ink-muted">Secretary handles: </dt>
            <dd className="inline">{STAFF_CATEGORY_OWNERSHIP.SECRETARY.join(", ")}</dd>
          </div>
        </dl>
        <SubmitButton pendingLabel="Submitting…">
          <Send size={16} />
          Submit concern
        </SubmitButton>
      </div>
    </form>
  );
}
