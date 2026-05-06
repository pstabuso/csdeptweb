import { Role } from "@prisma/client";

import { AppShell } from "@/components/layout/app-shell";
import { StaffDashboard } from "@/components/portal/staff-dashboard";
import { requireUser } from "@/lib/auth";
import {
  getConcernCategoryOptions,
  getScheduleEntries,
  getStaffDashboardData,
  normalizeConcernFilters,
  normalizeScheduleMonth,
} from "@/lib/dashboard-data";

type PageProps = {
  searchParams?: Promise<{
    status?: string;
    category?: string;
    sort?: string;
    query?: string;
    scheduleMonth?: string;
  }>;
};

function shiftMonth(month: string, delta: number) {
  const [year, monthPart] = month.split("-").map(Number);
  const next = new Date(year, monthPart - 1 + delta, 1);

  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

function buildHref(
  path: string,
  params: Record<string, string | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export default async function SecretaryPage({ searchParams }: PageProps) {
  const user = await requireUser([Role.SECRETARY]);
  const params = (await searchParams) ?? {};
  const filters = normalizeConcernFilters({
    ...params,
    sort: params.sort ?? "open-first",
  });
  const scheduleMonth = normalizeScheduleMonth(params.scheduleMonth);
  const [concerns, categoryOptions, scheduleEntries] = await Promise.all([
    getStaffDashboardData(filters),
    getConcernCategoryOptions(),
    getScheduleEntries(scheduleMonth),
  ]);
  const concernRedirectTo = buildHref("/secretary", {
    status: filters.status !== "ALL" ? filters.status : undefined,
    category: filters.category !== "ALL" ? filters.category : undefined,
    sort: filters.sort !== "open-first" ? filters.sort : undefined,
    query: filters.query || undefined,
    scheduleMonth,
  });
  const previousMonthHref = buildHref("/secretary", {
    status: filters.status !== "ALL" ? filters.status : undefined,
    category: filters.category !== "ALL" ? filters.category : undefined,
    sort: filters.sort !== "open-first" ? filters.sort : undefined,
    query: filters.query || undefined,
    scheduleMonth: shiftMonth(scheduleMonth, -1),
  });
  const nextMonthHref = buildHref("/secretary", {
    status: filters.status !== "ALL" ? filters.status : undefined,
    category: filters.category !== "ALL" ? filters.category : undefined,
    sort: filters.sort !== "open-first" ? filters.sort : undefined,
    query: filters.query || undefined,
    scheduleMonth: shiftMonth(scheduleMonth, 1),
  });

  return (
    <AppShell
      user={user}
      title="Secretary queue"
      description="Sort, respond, and post availability."
      currentPath="/secretary"
    >
      <StaffDashboard
        role={Role.SECRETARY}
        concerns={concerns}
        filters={filters}
        categoryOptions={categoryOptions}
        concernPath="/secretary"
        concernRedirectTo={concernRedirectTo}
        scheduleMonth={scheduleMonth}
        scheduleEntries={scheduleEntries}
        previousMonthHref={previousMonthHref}
        nextMonthHref={nextMonthHref}
      />
    </AppShell>
  );
}
