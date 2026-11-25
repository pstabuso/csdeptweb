import { ScheduleBoard } from "@/components/portal/schedule-board";
import { getScheduleEntries } from "@/lib/dashboard-data";
import { buildHref } from "@/lib/href";
import { shiftScheduleMonth } from "@/lib/ph-time";

/** Month calendar for any role. `path` is the page's own URL, e.g. "/student/calendar". */
export async function CalendarView({
  path,
  month,
  canManage,
}: {
  path: string;
  month: string;
  canManage: boolean;
}) {
  const entries = await getScheduleEntries(month);

  return (
    <ScheduleBoard
      month={month}
      entries={entries}
      canManage={canManage}
      previousMonthHref={buildHref(path, { month: shiftScheduleMonth(month, -1) })}
      nextMonthHref={buildHref(path, { month: shiftScheduleMonth(month, 1) })}
      currentMonthHref={path}
      redirectTo={buildHref(path, { month })}
    />
  );
}
