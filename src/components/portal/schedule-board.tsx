import { ScheduleEntry, User } from "@prisma/client";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import {
  createScheduleEntry,
  deleteScheduleEntry,
  updateScheduleEntry,
} from "@/app/actions/schedule";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  formatDate,
  formatMonthLabel,
  formatRoleLabel,
  formatTimeRange,
} from "@/lib/format";
import {
  formatManilaDateTimeLocalValue,
  getManilaDateKey,
  getManilaMonthGrid,
} from "@/lib/ph-time";

type ScheduleRecord = ScheduleEntry & {
  createdBy: Pick<User, "name" | "role">;
};

type ScheduleBoardProps = {
  month: string;
  entries: ScheduleRecord[];
  canManage: boolean;
  previousMonthHref: string;
  nextMonthHref: string;
  redirectTo: string;
  title: string;
  description?: string;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-400";

const actionButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08] active:translate-y-px";

function FormLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function EntrySummary({ entry }: { entry: ScheduleRecord }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="truncate text-base font-semibold text-white">
          {entry.title}
        </h3>
        <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-2 py-1 text-[11px] font-semibold text-violet-100">
          {formatRoleLabel(entry.createdBy.role)}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={14} />
          {formatDate(entry.startsAt)} / {formatTimeRange(entry.startsAt, entry.endsAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={14} />
          {entry.location}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Posted by {entry.createdBy.name}
      </p>
      {entry.notes ? (
        <p className="mt-3 max-h-12 overflow-hidden rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm leading-6 text-slate-300">
          {entry.notes}
        </p>
      ) : null}
    </div>
  );
}

function EntryForm({
  entry,
  redirectTo,
}: {
  entry: ScheduleRecord;
  redirectTo: string;
}) {
  return (
    <form
      action={updateScheduleEntry.bind(null, entry.id)}
      className="mt-4 space-y-3 border-t border-white/10 pt-4"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="grid gap-3 md:grid-cols-2">
        <FormLabel label="Title">
          <input
            name="title"
            defaultValue={entry.title}
            required
            className={inputClass}
          />
        </FormLabel>
        <FormLabel label="Location">
          <input
            name="location"
            defaultValue={entry.location}
            required
            className={inputClass}
          />
        </FormLabel>
        <FormLabel label="Start, PH time">
          <input
            name="startsAt"
            type="datetime-local"
            defaultValue={formatManilaDateTimeLocalValue(entry.startsAt)}
            required
            className={inputClass}
          />
        </FormLabel>
        <FormLabel label="End, same day">
          <input
            name="endsAt"
            type="datetime-local"
            defaultValue={formatManilaDateTimeLocalValue(entry.endsAt)}
            required
            className={inputClass}
          />
        </FormLabel>
      </div>
      <FormLabel label="Notes">
        <textarea
          name="notes"
          rows={2}
          defaultValue={entry.notes ?? ""}
          className={inputClass}
        />
      </FormLabel>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <SubmitButton pendingLabel="Saving..." className="rounded-lg px-4 py-2.5">
          <Save size={16} />
          Save edits
        </SubmitButton>
        <button
          type="submit"
          formAction={deleteScheduleEntry.bind(null, entry.id)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-300/25 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20 active:translate-y-px"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </form>
  );
}

export function ScheduleBoard({
  month,
  entries,
  canManage,
  previousMonthHref,
  nextMonthHref,
  redirectTo,
  title,
  description,
}: ScheduleBoardProps) {
  const grid = getManilaMonthGrid(month);
  const entriesByDay = entries.reduce<Record<string, ScheduleRecord[]>>(
    (accumulator, entry) => {
      const key = getManilaDateKey(entry.startsAt);
      accumulator[key] = [...(accumulator[key] || []), entry];
      return accumulator;
    },
    {},
  );

  return (
    <section
      id="schedule"
      className="animate-enter space-y-4 scroll-mt-5 rounded-lg border border-slate-800 bg-slate-900/88 p-4 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.95)] xl:p-5"
    >
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200/80">
            <CalendarClock size={14} />
            Calendar
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href={previousMonthHref} className={actionButtonClass}>
            <ChevronLeft size={15} />
            Prev
          </Link>
          <span className="rounded-lg border border-violet-300/20 bg-violet-400/10 px-3 py-2 font-semibold text-white">
            {formatMonthLabel(month)}
          </span>
          <Link href={nextMonthHref} className={actionButtonClass}>
            Next
            <ChevronRight size={15} />
          </Link>
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
            PH time
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.82fr)_minmax(280px,1fr)]">
        <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {grid.map((cell) => {
              if (!cell.dayNumber) {
                return <div key={cell.key} className="min-h-12" />;
              }

              const dayKey = `${month}-${String(cell.dayNumber).padStart(2, "0")}`;
              const dayEntries = entriesByDay[dayKey] || [];
              const hasEntries = dayEntries.length > 0;

              return (
                <div
                  key={cell.key}
                  className={`min-h-12 rounded-lg border p-2 ${
                    hasEntries
                      ? "border-violet-300/25 bg-violet-400/10"
                      : "border-white/10 bg-slate-950/70"
                  }`}
                  title={
                    hasEntries
                      ? `${dayEntries.length} schedule entr${
                          dayEntries.length === 1 ? "y" : "ies"
                        }`
                      : undefined
                  }
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-sm font-semibold text-white">
                      {cell.dayNumber}
                    </span>
                    {hasEntries ? (
                      <span className="rounded-full bg-violet-300 px-1.5 py-0.5 text-[10px] font-bold text-slate-950">
                        {dayEntries.length}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              Agenda
            </h3>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-slate-300">
              {entries.length}
            </span>
          </div>

          {entries.length ? (
            <div className="space-y-2">
              {entries.map((entry) =>
                canManage ? (
                  <details
                    key={entry.id}
                    className="group rounded-lg border border-white/10 bg-slate-950/70 p-4"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                      <EntrySummary entry={entry} />
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 group-open:bg-violet-400/10">
                        <Pencil size={14} />
                        Edit
                      </span>
                    </summary>
                    <EntryForm entry={entry} redirectTo={redirectTo} />
                  </details>
                ) : (
                  <article
                    key={entry.id}
                    className="rounded-lg border border-white/10 bg-slate-950/70 p-4"
                  >
                    <EntrySummary entry={entry} />
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-white/15 bg-slate-950/50 px-4 py-4 text-sm text-slate-400">
              No schedule entries for this month.
            </div>
          )}
        </div>
      </div>

      {canManage ? (
        <form
          action={createScheduleEntry}
          className="space-y-3 rounded-lg border border-white/10 bg-slate-950/70 p-4"
        >
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-white">New entry</h3>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-slate-300">
              Visible to students
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FormLabel label="Title">
              <input
                name="title"
                required
                placeholder="Consultation, office hour, meeting"
                className={inputClass}
              />
            </FormLabel>
            <FormLabel label="Location">
              <input
                name="location"
                required
                placeholder="Faculty room, lab, online"
                className={inputClass}
              />
            </FormLabel>
            <FormLabel label="Start, PH time">
              <input
                name="startsAt"
                type="datetime-local"
                required
                className={inputClass}
              />
            </FormLabel>
            <FormLabel label="End, same day">
              <input
                name="endsAt"
                type="datetime-local"
                required
                className={inputClass}
              />
            </FormLabel>
          </div>
          <FormLabel label="Notes">
            <textarea
              name="notes"
              rows={2}
              placeholder="Optional context"
              className={inputClass}
            />
          </FormLabel>
          <SubmitButton pendingLabel="Saving schedule...">
            <Plus size={16} />
            Add entry
          </SubmitButton>
        </form>
      ) : null}
    </section>
  );
}
