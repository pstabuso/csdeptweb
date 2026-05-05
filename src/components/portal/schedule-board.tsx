import Link from "next/link";
import { ScheduleEntry, User } from "@prisma/client";

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
  description: string;
};

function getDateTimeLocalValue(value: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(value).map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function getDayKey(value: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(value).map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getMonthGrid(month: string) {
  const [year, monthPart] = month.split("-").map(Number);
  const firstDay = new Date(year, monthPart - 1, 1);
  const lastDay = new Date(year, monthPart, 0);
  const cells: Array<{ key: string; dayNumber: number | null }> = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    cells.push({ key: `blank-start-${index}`, dayNumber: null });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    cells.push({
      key: `${month}-${String(day).padStart(2, "0")}`,
      dayNumber: day,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `blank-end-${cells.length}`, dayNumber: null });
  }

  return cells;
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
  const grid = getMonthGrid(month);
  const entryCountByDay = entries.reduce<Record<string, number>>((accumulator, entry) => {
    const key = getDayKey(entry.startsAt);
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return (
    <section className="space-y-4 rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-4 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              Schedule
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href={previousMonthHref}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200 transition hover:bg-white/10"
            >
              Prev
            </Link>
            <span className="rounded-xl border border-violet-300/15 bg-violet-400/10 px-4 py-2 font-semibold text-white">
              {formatMonthLabel(month)}
            </span>
            <Link
              href={nextMonthHref}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200 transition hover:bg-white/10"
            >
              Next
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {grid.map((cell) => {
          if (!cell.dayNumber) {
            return (
              <div
                key={cell.key}
                className="min-h-16 rounded-xl border border-transparent bg-transparent"
              />
            );
          }

          const dayKey = `${month}-${String(cell.dayNumber).padStart(2, "0")}`;
          const count = entryCountByDay[dayKey] || 0;

          return (
            <div
              key={cell.key}
              className="min-h-16 rounded-xl border border-white/10 bg-slate-900/70 p-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  {cell.dayNumber}
                </span>
                {count ? (
                  <span className="rounded-full bg-violet-400/15 px-2 py-1 text-[10px] font-semibold text-violet-100 ring-1 ring-inset ring-violet-300/30">
                    {count}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 space-y-2">
                {count ? (
                  Array.from({ length: Math.min(count, 3) }).map((_, index) => (
                    <div
                      key={`${cell.key}-marker-${index}`}
                      className="h-1.5 rounded-full bg-violet-300/70"
                    />
                  ))
                ) : (
                  <div className="h-2 rounded-full bg-white/5" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {canManage ? (
        <form
          action={createScheduleEntry}
          className="space-y-3 rounded-[1.3rem] border border-white/10 bg-slate-900/80 p-4"
        >
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">Add entry</h3>
            <p className="text-sm text-slate-400">Student-visible calendar.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="title"
              required
              placeholder="Event title"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
            />
            <input
              name="location"
              required
              placeholder="Location"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
            />
            <input
              name="startsAt"
              type="datetime-local"
              required
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
            />
            <input
              name="endsAt"
              type="datetime-local"
              required
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
            />
          </div>
          <textarea
            name="notes"
            rows={2}
            placeholder="Notes"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
          />
          <SubmitButton pendingLabel="Saving schedule...">
            Add to calendar
          </SubmitButton>
        </form>
      ) : null}

      <div className="space-y-3">
        {entries.length ? (
          entries.map((entry) =>
            canManage ? (
              <form
                key={entry.id}
                action={updateScheduleEntry.bind(null, entry.id)}
                className="space-y-3 rounded-[1.3rem] border border-white/10 bg-slate-900/80 p-4"
              >
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    name="title"
                    defaultValue={entry.title}
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                  />
                  <input
                    name="location"
                    defaultValue={entry.location}
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                  />
                  <input
                    name="startsAt"
                    type="datetime-local"
                    defaultValue={getDateTimeLocalValue(entry.startsAt)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                  />
                  <input
                    name="endsAt"
                    type="datetime-local"
                    defaultValue={getDateTimeLocalValue(entry.endsAt)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                  />
                </div>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={entry.notes ?? ""}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400"
                />
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-slate-400">
                    <p>{formatDate(entry.startsAt)}</p>
                    <p>{formatTimeRange(entry.startsAt, entry.endsAt)}</p>
                    <p>
                      Added by {entry.createdBy.name} (
                      {formatRoleLabel(entry.createdBy.role)})
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <SubmitButton
                      pendingLabel="Saving..."
                      className="rounded-xl px-4 py-2.5"
                    >
                      Save changes
                    </SubmitButton>
                    <button
                      formAction={deleteScheduleEntry.bind(null, entry.id)}
                      className="rounded-xl border border-rose-300/20 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <article
                key={entry.id}
                className="rounded-[1.3rem] border border-white/10 bg-slate-900/80 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {entry.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {entry.location}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {formatDate(entry.startsAt)} /{" "}
                      {formatTimeRange(entry.startsAt, entry.endsAt)}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Posted by {entry.createdBy.name} (
                      {formatRoleLabel(entry.createdBy.role)})
                    </p>
                  </div>
                  <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold text-violet-100 ring-1 ring-inset ring-violet-300/20">
                    {formatRoleLabel(entry.createdBy.role)}
                  </span>
                </div>
                {entry.notes ? (
                  <p className="mt-3 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm leading-6 text-slate-200">
                    {entry.notes}
                  </p>
                ) : null}
              </article>
            ),
          )
        ) : (
          <div className="rounded-[1.3rem] border border-dashed border-white/15 bg-slate-900/60 px-4 py-4 text-sm text-slate-400">
            No schedule entries yet for this month.
          </div>
        )}
      </div>
    </section>
  );
}
