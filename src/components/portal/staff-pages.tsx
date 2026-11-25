import { Role } from "@prisma/client";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { CalendarView } from "@/components/portal/calendar-view";
import { ConcernDetailView } from "@/components/portal/concern-detail";
import { ConcernQueue } from "@/components/portal/concern-queue";
import { Notice } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { STAFF_CATEGORY_OWNERSHIP, type StaffRole } from "@/lib/constants";
import {
  type ConcernFilterDefaults,
  type ConcernSearchParams,
  getConcernCategoryOptions,
  getConcernDetail,
  getConcernQueue,
  getStudentConcernHistory,
  normalizeConcernFilters,
  normalizeScheduleMonth,
} from "@/lib/dashboard-data";

const STAFF_QUEUE_DEFAULTS: ConcernFilterDefaults = {
  status: "OPEN",
  scope: "mine",
  sort: "open-first",
};

const staffCopy: Record<StaffRole, { mineLabel: string; queueDescription: string }> = {
  COORDINATOR: {
    mineLabel: "My categories",
    queueDescription: `Your categories: ${STAFF_CATEGORY_OWNERSHIP.COORDINATOR.join(", ")}.`,
  },
  SECRETARY: {
    mineLabel: "My categories",
    queueDescription: `Your categories: ${STAFF_CATEGORY_OWNERSHIP.SECRETARY.join(", ")}.`,
  },
};

function basePathFor(role: StaffRole) {
  return role === "COORDINATOR" ? "/coordinator" : "/secretary";
}

export async function StaffQueuePage({
  role,
  searchParams,
}: {
  role: StaffRole;
  searchParams?: Promise<ConcernSearchParams & { notice?: string }>;
}) {
  const user = await requireUser([role as Role]);
  const params = (await searchParams) ?? {};
  const filters = normalizeConcernFilters(params, STAFF_QUEUE_DEFAULTS);
  const basePath = basePathFor(role);
  const [queue, categoryOptions] = await Promise.all([
    getConcernQueue(filters, STAFF_CATEGORY_OWNERSHIP[role]),
    getConcernCategoryOptions(),
  ]);

  return (
    <AppShell user={user} title="Concern queue" description={staffCopy[role].queueDescription}>
      <div className="space-y-4">
        <Notice code={params.notice} />
        <ConcernQueue
          listPath={basePath}
          detailBasePath={`${basePath}/concerns`}
          filters={filters}
          defaults={STAFF_QUEUE_DEFAULTS}
          queue={queue}
          categoryOptions={categoryOptions}
          mineLabel={staffCopy[role].mineLabel}
        />
      </div>
    </AppShell>
  );
}

export async function StaffConcernPage({
  role,
  params,
  searchParams,
}: {
  role: StaffRole;
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ notice?: string }>;
}) {
  const user = await requireUser([role as Role]);
  const { id } = await params;
  const { notice } = (await searchParams) ?? {};
  const concern = await getConcernDetail(id);

  if (!concern) {
    notFound();
  }

  const history = await getStudentConcernHistory(concern.studentId, concern.id);
  const basePath = basePathFor(role);

  return (
    <AppShell
      user={user}
      title={concern.subject}
      backLink={{ href: basePath, label: "Back to queue" }}
    >
      <div className="space-y-4">
        <Notice code={notice} />
        <ConcernDetailView
          concern={concern}
          viewer="staff"
          history={history}
          detailBasePath={`${basePath}/concerns`}
        />
      </div>
    </AppShell>
  );
}

export async function StaffCalendarPage({
  role,
  searchParams,
}: {
  role: StaffRole;
  searchParams?: Promise<{ month?: string; notice?: string }>;
}) {
  const user = await requireUser([role as Role]);
  const params = (await searchParams) ?? {};
  const month = normalizeScheduleMonth(params.month);
  const canManage = role === "SECRETARY";
  const path = `${basePathFor(role)}/calendar`;

  return (
    <AppShell
      user={user}
      title="Department calendar"
      description={
        canManage
          ? "Post consultation hours, office closures and meetings. Students see every entry."
          : "Read-only. Ask the department secretary to post or change entries."
      }
    >
      <div className="space-y-4">
        <Notice code={params.notice} />
        <CalendarView path={path} month={month} canManage={canManage} />
      </div>
    </AppShell>
  );
}
