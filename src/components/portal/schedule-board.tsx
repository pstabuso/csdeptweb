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
    <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_-50px_rgba(8,15,28,0.95)] backdrop-blur">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
              Shared schedule
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
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
            <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white">
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

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {grid.map((cell) => {
          if (!cell.dayNumber) {
            return (
              <div
                key={cell.key}
                className="min-h-20 rounded-2xl border border-transparent bg-transparent"
              />
            );
          }

          const dayKey = `${month}-${String(cell.dayNumber).padStart(2, "0")}`;
          const count = entryCountByDay[dayKey] || 0;

          return (
            <div
              key={cell.key}
              className="min-h-20 rounded-2xl border border-white/10 bg-slate-900/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  {cell.dayNumber}
                </span>
                {count ? (
                  <span className="rounded-full bg-cyan-400/15 px-2 py-1 text-[10px] font-semibold text-cyan-200 ring-1 ring-inset ring-cyan-300/30">
                    {count}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 space-y-2">
                {count ? (
                  Array.from({ length: Math.min(count, 3) }).map((_, index) => (
                    <div
                      key={`${cell.key}-marker-${index}`}
                      className="h-2 rounded-full bg-cyan-300/70"
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
          className="space-y-4 rounded-[1.7rem] border border-white/10 bg-slate-900/80 p-5"
        >
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">Add schedule entry</h3>
            <p className="text-sm text-slate-400">
              Coordinators and secretaries can maintain the department calendar
              here for student visibility.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="title"
              required
              placeholder="Event title"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-400"
            />
            <input
              name="location"
              required
              placeholder="Location"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-400"
            />
            <input
              name="startsAt"
              type="datetime-local"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-400"
            />
            <input
              name="endsAt"
              type="datetime-local"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-400"
            />
          </div>
          <textarea
            name="notes"
            rows={3}
            placeholder="Optional notes for students and staff"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-400"
          />
          <SubmitButton pendingLabel="Saving schedule...">
            Add to calendar
          </SubmitButton>
        </form>
      ) : null}

      <div className="space-y-4">
        {entries.length ? (
          entries.map((entry) =>
            canManage ? (
              <form
                key={entry.id}
                action={updateScheduleEntry.bind(null, entry.id)}
                className="space-y-4 rounded-[1.7rem] border border-white/10 bg-slate-900/80 p-5"
              >
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    name="title"
                    defaultValue={entry.title}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-400"
                  />
                  <input
                    name="location"
                    defaultValue={entry.location}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-400"
                  />
                  <input
                    name="startsAt"
                    type="datetime-local"
                    defaultValue={getDateTimeLocalValue(entry.startsAt)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-400"
                  />
                  <input
                    name="endsAt"
                    type="datetime-local"
                    defaultValue={getDateTimeLocalValue(entry.endsAt)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-400"
                  />
                </div>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={entry.notes ?? ""}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-fuchsia-400"
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
                      className="rounded-2xl px-5 py-3"
                    >
                      Save changes
                    </SubmitButton>
                    <button
                      formAction={deleteScheduleEntry.bind(null, entry.id)}
                      className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <article
                key={entry.id}
                className="rounded-[1.7rem] border border-white/10 bg-slate-900/80 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
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
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-inset ring-white/10">
                    {formatRoleLabel(entry.createdBy.role)}
                  </span>
                </div>
                {entry.notes ? (
                  <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm leading-6 text-slate-200">
                    {entry.notes}
                  </p>
                ) : null}
              </article>
            ),
          )
        ) : (
          <div className="rounded-[1.7rem] border border-dashed border-white/15 bg-slate-900/60 px-5 py-6 text-sm text-slate-400">
            No schedule entries yet for this month.
          </div>
        )}
      </div>
    </section>
  );
}
