import { Role } from "@prisma/client";

import { AppShell } from "@/components/layout/app-shell";
import { CalendarView } from "@/components/portal/calendar-view";
import { requireUser } from "@/lib/auth";
import { normalizeScheduleMonth } from "@/lib/dashboard-data";

type PageProps = {
  searchParams?: Promise<{ month?: string }>;
};

export default async function StudentCalendarPage({ searchParams }: PageProps) {
  const user = await requireUser([Role.STUDENT]);
  const month = normalizeScheduleMonth((await searchParams)?.month);

  return (
    <AppShell
      user={user}
      title="Department calendar"
      description="Consultation hours, office closures and other department schedules."
    >
      <CalendarView path="/student/calendar" month={month} canManage={false} />
    </AppShell>
  );
}
