import { ChevronLeft, ChevronRight, Clock3, MapPin, Pencil, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  createScheduleEntry,
  deleteScheduleEntry,
  updateScheduleEntry,
} from "@/app/actions/schedule";
import { SubmitButton } from "@/components/forms/submit-button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/primitives";
import { cx } from "@/lib/cx";
import type { ScheduleRecord } from "@/lib/dashboard-data";
import { formatDate, formatMonthLabel, formatRoleLabel, formatTimeRange } from "@/lib/format";
import {
  formatManilaDateTimeLocalValue,
  getManilaDateKey,
  getManilaMonthGrid,
} from "@/lib/ph-time";

type ScheduleBoardProps = {
  month: string;
  entries: ScheduleRecord[];
  canManage: boolean;
  previousMonthHref: string;
  nextMonthHref: string;
  currentMonthHref: string;
  redirectTo: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function EntryFields({ entry }: { entry?: ScheduleRecord }) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="field">
          <span className="label">Title</span>
          <input
            name="title"
            defaultValue={entry?.title}
            required
            minLength={3}
            placeholder="Consultation hours, office closed, meeting…"
            className="input"
            aria-label="Title"
          />
        </div>
        <div className="field">
          <span className="label">Location</span>
          <input
            name="location"
            defaultValue={entry?.location}
            required
            minLength={2}
            placeholder="Faculty room, lab, online"
            className="input"
            aria-label="Location"
          />
        </div>
        <div className="field">
          <span className="label">Starts</span>
          <input
            name="startsAt"
            type="datetime-local"
            defaultValue={entry ? formatManilaDateTimeLocalValue(entry.startsAt) : undefined}
            required
            className="input"
            aria-label="Starts"
          />
        </div>
        <div className="field">
          <span className="label">Ends (same day)</span>
          <input
            name="endsAt"
            type="datetime-local"
            defaultValue={entry ? formatManilaDateTimeLocalValue(entry.endsAt) : undefined}
            required
            className="input"
            aria-label="Ends"
          />
        </div>
      </div>
      <div className="field">
        <span className="label">Notes (optional)</span>
        <textarea
          name="notes"
          rows={2}
          defaultValue={entry?.notes ?? ""}
          className="input"
          aria-label="Notes"
        />
      </div>
      <p className="hint">Times are Philippine time. Entries are visible to students.</p>
    </>
  );
}

function EntryCard({
  entry,
  canManage,
  redirectTo,
}: {
  entry: ScheduleRecord;
  canManage: boolean;
  redirectTo: string;
}) {
  const summary = (
    <div className="min-w-0 flex-1">
      <p className="font-medium text-ink">{entry.title}</p>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={14} />
          {formatTimeRange(entry.startsAt, entry.endsAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={14} />
          {entry.location}
        </span>
      </div>
      {entry.notes ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">{entry.notes}</p>
      ) : null}
      <p className="hint mt-2">
        Posted by {entry.createdBy.name} · {formatRoleLabel(entry.createdBy.role)}
      </p>
    </div>
  );

  if (!canManage) {
    return <article className="panel p-4">{summary}</article>;
  }

  return (
    <details className="group panel p-4">
      <summary className="flex cursor-pointer list-none items-start gap-3">
        {summary}
        <span className="btn-secondary btn-sm shrink-0 group-open:bg-violet-500/15">
          <Pencil size={13} />
          Edit
        </span>
      </summary>
      <form
        action={updateScheduleEntry.bind(null, entry.id)}
        className="mt-4 space-y-3 border-t border-line pt-4"
      >
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <EntryFields entry={entry} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <ConfirmSubmitButton
            formAction={deleteScheduleEntry.bind(null, entry.id)}
            confirmMessage={`Delete “${entry.title}”? Students will no longer see it.`}
          >
            <Trash2 size={15} />
            Delete
          </ConfirmSubmitButton>
          <SubmitButton pendingLabel="Saving…">
            <Save size={15} />
            Save changes
          </SubmitButton>
        </div>
      </form>
    </details>
  );
}

export function ScheduleBoard({
  month,
  entries,
  canManage,
  previousMonthHref,
  nextMonthHref,
  currentMonthHref,
  redirectTo,
}: ScheduleBoardProps) {
  const grid = getManilaMonthGrid(month);
  const todayKey = getManilaDateKey(new Date());
  const entriesByDay = entries.reduce<Record<string, ScheduleRecord[]>>((accumulator, entry) => {
    const key = getManilaDateKey(entry.startsAt);
    (accumulator[key] ??= []).push(entry);
    return accumulator;
  }, {});
  const agendaDays = Object.keys(entriesByDay).sort();

  return (
    <div className="space-y-4">
      {canManage ? (
        <details className="card group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:px-5">
            <span className="inline-flex items-center gap-2 font-medium text-ink">
              <Plus size={16} className="text-violet-300" />
              Add calendar entry
            </span>
            <span className="hint group-open:hidden">Click to open</span>
          </summary>
          <form
            action={createScheduleEntry}
            className="space-y-3 border-t border-line p-4 sm:px-5"
          >
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <EntryFields />
            <div className="flex justify-end">
              <SubmitButton pendingLabel="Saving…">
                <Plus size={15} />
                Add entry
              </SubmitButton>
            </div>
          </form>
        </details>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="card card-pad">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-ink">{formatMonthLabel(month)}</h2>
            <div className="flex items-center gap-1">
              <Link href={previousMonthHref} className="btn-ghost btn-sm" aria-label="Previous month">
                <ChevronLeft size={16} />
              </Link>
              <Link href={currentMonthHref} className="btn-secondary btn-sm">
                Today
              </Link>
              <Link href={nextMonthHref} className="btn-ghost btn-sm" aria-label="Next month">
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-faint">
            {WEEKDAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((cell) => {
              if (!cell.dayNumber) {
                return <div key={cell.key} className="aspect-square" />;
              }

              const dayKey = cell.key;
              const count = entriesByDay[dayKey]?.length ?? 0;
              const isToday = dayKey === todayKey;

              return (
                <div
                  key={cell.key}
                  className={cx(
                    "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm",
                    isToday
                      ? "bg-violet-500 font-semibold text-white"
                      : count
                        ? "bg-violet-500/10 text-ink"
                        : "text-ink-muted",
                  )}
                  title={count ? `${count} entr${count === 1 ? "y" : "ies"}` : undefined}
                >
                  {cell.dayNumber}
                  <span
                    className={cx(
                      "h-1 w-1 rounded-full",
                      count ? (isToday ? "bg-white" : "bg-violet-300") : "bg-transparent",
                    )}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="card card-pad">
          <h2 className="font-semibold text-ink">Agenda</h2>
          {agendaDays.length ? (
            <div className="mt-3 space-y-4">
              {agendaDays.map((dayKey) => (
                <div key={dayKey}>
                  <h3
                    className={cx(
                      "mb-2 text-xs font-semibold uppercase tracking-wider",
                      dayKey === todayKey ? "text-violet-300" : "text-ink-faint",
                    )}
                  >
                    {dayKey === todayKey ? "Today · " : ""}
                    {formatDate(entriesByDay[dayKey][0].startsAt)}
                  </h3>
                  <div className="space-y-2">
                    {entriesByDay[dayKey].map((entry) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        canManage={canManage}
                        redirectTo={redirectTo}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3">
              <EmptyState
                title="Nothing scheduled this month"
                description={canManage ? "Use “Add calendar entry” above to post availability." : undefined}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function UpcomingSchedule({ entries }: { entries: ScheduleRecord[] }) {
  if (!entries.length) {
    return <p className="muted">No upcoming entries.</p>;
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.id} className="panel px-3 py-2.5">
          <p className="text-sm font-medium text-ink">{entry.title}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {formatDate(entry.startsAt)} · {formatTimeRange(entry.startsAt, entry.endsAt)} ·{" "}
            {entry.location}
          </p>
        </li>
      ))}
    </ul>
  );
}
