import { Role } from "@prisma/client";

import { AppShell } from "@/components/layout/app-shell";
import { CalendarView } from "@/components/portal/calendar-view";
import { requireUser } from "@/lib/auth";
import { normalizeScheduleMonth } from "@/lib/dashboard-data";

type PageProps = {
  searchParams?: Promise<{ month?: string }>;
};

export default async function AdminCalendarPage({ searchParams }: PageProps) {
  const user = await requireUser([Role.ADMIN]);
  const month = normalizeScheduleMonth((await searchParams)?.month);

  return (
    <AppShell
      user={user}
      title="Department calendar"
      description="Read-only. The department secretary maintains this calendar."
    >
      <CalendarView path="/admin/calendar" month={month} canManage={false} />
    </AppShell>
  );
}
