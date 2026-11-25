import "server-only";

import { ConcernStatus, Prisma, Role, UserStatus } from "@prisma/client";

import {
  ACTIVITY_PAGE_SIZE,
  CONCERN_SORT_OPTIONS,
  getCategoryOwner,
  QUEUE_PAGE_SIZE,
  type StaffRole,
  STUDENT_CONCERN_CATEGORIES,
} from "@/lib/constants";
import { getManilaMonthRange } from "@/lib/ph-time";
import { getDb } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/* Filters                                                                    */
/* -------------------------------------------------------------------------- */

export type ConcernSort = (typeof CONCERN_SORT_OPTIONS)[number];

export type ConcernFilterState = {
  status: "ALL" | ConcernStatus;
  category: string;
  sort: ConcernSort;
  query: string;
  scope: "mine" | "all";
  page: number;
};

export type ConcernSearchParams = {
  status?: string;
  category?: string;
  sort?: string;
  query?: string;
  scope?: string;
  page?: string;
};

export function normalizePage(value?: string) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export type ConcernFilterDefaults = {
  status?: ConcernFilterState["status"];
  sort?: ConcernSort;
  scope?: "mine" | "all";
};

export function normalizeConcernFilters(
  params: ConcernSearchParams | undefined,
  defaults: ConcernFilterDefaults = {},
): ConcernFilterState {
  const status =
    params?.status === "OPEN" ||
    params?.status === "ANSWERED" ||
    params?.status === "CLOSED" ||
    params?.status === "ALL"
      ? params.status
      : (defaults.status ?? "ALL");
  const sort = CONCERN_SORT_OPTIONS.includes(params?.sort as ConcernSort)
    ? (params?.sort as ConcernSort)
    : (defaults.sort ?? "open-first");
  const scope =
    params?.scope === "mine" || params?.scope === "all"
      ? params.scope
      : (defaults.scope ?? "all");

  return {
    status,
    category: params?.category?.trim() || "ALL",
    sort,
    query: params?.query?.trim() || "",
    scope,
    page: normalizePage(params?.page),
  };
}

/** Turns filter state back into query params (omitting defaults). */
export function concernFiltersToParams(
  filters: ConcernFilterState,
  defaults: ConcernFilterDefaults = {},
  overrides: Partial<ConcernFilterState> = {},
) {
  const merged = { ...filters, ...overrides };

  return {
    status: merged.status !== (defaults.status ?? "ALL") ? merged.status : undefined,
    category: merged.category !== "ALL" ? merged.category : undefined,
    sort: merged.sort !== (defaults.sort ?? "open-first") ? merged.sort : undefined,
    query: merged.query || undefined,
    scope: merged.scope !== (defaults.scope ?? "all") ? merged.scope : undefined,
    page: merged.page > 1 ? merged.page : undefined,
  };
}

function buildSearchWhere(query: string): Prisma.ConcernWhereInput {
  const contains = { contains: query, mode: "insensitive" as const };

  return {
    OR: [
      { subject: contains },
      { message: contains },
      { student: { is: { name: contains } } },
      { student: { is: { email: contains } } },
      { student: { is: { studentNumber: contains } } },
    ],
  };
}

function buildConcernWhere(
  filters: ConcernFilterState,
  ownedCategories: readonly string[] | null,
  { includeStatus }: { includeStatus: boolean },
): Prisma.ConcernWhereInput {
  const and: Prisma.ConcernWhereInput[] = [];

  if (includeStatus && filters.status !== "ALL") {
    and.push({ status: filters.status });
  }

  if (filters.scope === "mine" && ownedCategories) {
    and.push({ category: { in: [...ownedCategories] } });
  }

  if (filters.category !== "ALL") {
    and.push({ category: filters.category });
  }

  if (filters.query) {
    and.push(buildSearchWhere(filters.query));
  }

  return and.length ? { AND: and } : {};
}

function buildConcernOrderBy(
  sort: ConcernSort,
): Prisma.ConcernOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "oldest":
      return [{ createdAt: "asc" }];
    case "open-first":
      // Postgres sorts enums by declaration order: OPEN, ANSWERED, CLOSED.
      // Oldest first within a status so long-waiting students are seen first.
      return [{ status: "asc" }, { updatedAt: "asc" }];
    case "recent":
    default:
      return [{ updatedAt: "desc" }];
  }
}

/* -------------------------------------------------------------------------- */
/* Concerns                                                                   */
/* -------------------------------------------------------------------------- */

const queueInclude = {
  student: {
    select: { name: true, email: true, studentNumber: true },
  },
  replies: {
    select: {
      createdAt: true,
      author: { select: { name: true, role: true } },
    },
    orderBy: { createdAt: "desc" as const },
    take: 1,
  },
  _count: { select: { replies: true } },
} satisfies Prisma.ConcernInclude;

export type QueueConcern = Prisma.ConcernGetPayload<{ include: typeof queueInclude }>;

export type StatusCounts = Record<"ALL" | ConcernStatus, number>;

export async function getConcernQueue(
  filters: ConcernFilterState,
  ownedCategories: readonly string[] | null,
) {
  const db = getDb();
  const where = buildConcernWhere(filters, ownedCategories, { includeStatus: true });
  const countWhere = buildConcernWhere(filters, ownedCategories, { includeStatus: false });

  const [total, grouped] = await Promise.all([
    db.concern.count({ where }),
    db.concern.groupBy({
      by: ["status"],
      where: countWhere,
      _count: { _all: true },
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / QUEUE_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);

  const items = await db.concern.findMany({
    where,
    include: queueInclude,
    orderBy: buildConcernOrderBy(filters.sort),
    skip: (page - 1) * QUEUE_PAGE_SIZE,
    take: QUEUE_PAGE_SIZE,
  });

  const statusCounts: StatusCounts = { ALL: 0, OPEN: 0, ANSWERED: 0, CLOSED: 0 };
  grouped.forEach((group) => {
    statusCounts[group.status] = group._count._all;
    statusCounts.ALL += group._count._all;
  });

  return { items, total, page, pageCount, statusCounts };
}

const detailInclude = {
  student: {
    select: { id: true, name: true, email: true, studentNumber: true },
  },
  replies: {
    include: { author: { select: { name: true, role: true } } },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.ConcernInclude;

export type ConcernDetail = Prisma.ConcernGetPayload<{ include: typeof detailInclude }>;

export async function getConcernDetail(concernId: string) {
  const db = getDb();

  return db.concern.findUnique({
    where: { id: concernId },
    include: detailInclude,
  });
}

/** Other concerns from the same student, so staff have context. */
export async function getStudentConcernHistory(studentId: string, excludeId: string) {
  const db = getDb();

  return db.concern.findMany({
    where: { studentId, id: { not: excludeId } },
    select: { id: true, subject: true, status: true, category: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

export async function getConcernCategoryOptions() {
  const db = getDb();
  const categories = await db.concern.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });

  return Array.from(
    new Set([
      ...STUDENT_CONCERN_CATEGORIES,
      ...categories.map((entry) => entry.category),
    ]),
  );
}

/* -------------------------------------------------------------------------- */
/* Student                                                                    */
/* -------------------------------------------------------------------------- */

const studentListInclude = {
  replies: {
    select: { createdAt: true, author: { select: { role: true } } },
    orderBy: { createdAt: "desc" as const },
    take: 1,
  },
  _count: { select: { replies: true } },
} satisfies Prisma.ConcernInclude;

export type StudentConcernListItem = Prisma.ConcernGetPayload<{
  include: typeof studentListInclude;
}>;

export async function getStudentOverview(studentId: string) {
  const db = getDb();

  const [grouped, needsAttention, recent] = await Promise.all([
    db.concern.groupBy({
      by: ["status"],
      where: { studentId },
      _count: { _all: true },
    }),
    db.concern.findMany({
      where: { studentId, status: ConcernStatus.ANSWERED },
      include: studentListInclude,
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.concern.findMany({
      where: { studentId },
      include: studentListInclude,
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const counts: StatusCounts = { ALL: 0, OPEN: 0, ANSWERED: 0, CLOSED: 0 };
  grouped.forEach((group) => {
    counts[group.status] = group._count._all;
    counts.ALL += group._count._all;
  });

  return { counts, needsAttention, recent };
}

export type StudentConcernView = "active" | "closed" | "all";

export function normalizeStudentView(value?: string): StudentConcernView {
  return value === "closed" || value === "all" ? value : "active";
}

export async function getStudentConcerns(studentId: string, view: StudentConcernView) {
  const db = getDb();
  const statusWhere: Prisma.ConcernWhereInput =
    view === "active"
      ? { status: { not: ConcernStatus.CLOSED } }
      : view === "closed"
        ? { status: ConcernStatus.CLOSED }
        : {};

  const [items, activeCount, closedCount] = await Promise.all([
    db.concern.findMany({
      where: { studentId, ...statusWhere },
      include: studentListInclude,
      orderBy: { updatedAt: "desc" },
    }),
    db.concern.count({ where: { studentId, status: { not: ConcernStatus.CLOSED } } }),
    db.concern.count({ where: { studentId, status: ConcernStatus.CLOSED } }),
  ]);

  // Concerns with a fresh staff reply float to the top: ANSWERED, OPEN, CLOSED.
  const rank: Record<ConcernStatus, number> = { ANSWERED: 0, OPEN: 1, CLOSED: 2 };
  items.sort(
    (left, right) =>
      rank[left.status] - rank[right.status] ||
      right.updatedAt.getTime() - left.updatedAt.getTime(),
  );

  return { items, activeCount, closedCount };
}

/* -------------------------------------------------------------------------- */
/* Schedule                                                                   */
/* -------------------------------------------------------------------------- */

export function getDefaultScheduleMonth() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}`;
}

export function normalizeScheduleMonth(value?: string) {
  if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    return getDefaultScheduleMonth();
  }

  return value;
}

const scheduleInclude = {
  createdBy: { select: { name: true, role: true } },
} satisfies Prisma.ScheduleEntryInclude;

export type ScheduleRecord = Prisma.ScheduleEntryGetPayload<{
  include: typeof scheduleInclude;
}>;

export async function getScheduleEntries(month: string) {
  const db = getDb();
  const range = getManilaMonthRange(month);

  return db.scheduleEntry.findMany({
    where: {
      startsAt: { lt: range.end },
      endsAt: { gt: range.start },
    },
    include: scheduleInclude,
    orderBy: [{ startsAt: "asc" }, { endsAt: "asc" }],
  });
}

export async function getUpcomingScheduleEntries(limit = 4) {
  const db = getDb();

  return db.scheduleEntry.findMany({
    where: { endsAt: { gt: new Date() } },
    include: scheduleInclude,
    orderBy: { startsAt: "asc" },
    take: limit,
  });
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                      */
/* -------------------------------------------------------------------------- */

export async function getAdminOverview() {
  const db = getDb();

  const [
    usersByRole,
    usersByStatus,
    concernsByStatus,
    repliesCount,
    recentActivity,
    openByCategory,
  ] = await Promise.all([
    db.user.groupBy({ by: ["role"], _count: { _all: true } }),
    db.user.groupBy({ by: ["status"], _count: { _all: true } }),
    db.concern.groupBy({ by: ["status"], _count: { _all: true } }),
    db.concernReply.count(),
    db.auditLog.findMany({
      include: { actor: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.concern.groupBy({
      by: ["category"],
      where: { status: ConcernStatus.OPEN },
      _count: { _all: true },
    }),
  ]);

  const openByOwner: Record<StaffRole, number> = { COORDINATOR: 0, SECRETARY: 0 };
  openByCategory.forEach((group) => {
    openByOwner[getCategoryOwner(group.category)] += group._count._all;
  });

  const roleCounts: Record<Role, number> = {
    STUDENT: 0,
    COORDINATOR: 0,
    SECRETARY: 0,
    ADMIN: 0,
  };
  usersByRole.forEach((group) => {
    roleCounts[group.role] = group._count._all;
  });

  const accessCounts: Record<UserStatus, number> = { ACTIVE: 0, DISABLED: 0 };
  usersByStatus.forEach((group) => {
    accessCounts[group.status] = group._count._all;
  });

  const concernCounts: StatusCounts = { ALL: 0, OPEN: 0, ANSWERED: 0, CLOSED: 0 };
  concernsByStatus.forEach((group) => {
    concernCounts[group.status] = group._count._all;
    concernCounts.ALL += group._count._all;
  });

  return {
    roleCounts,
    accessCounts,
    totalUsers: accessCounts.ACTIVE + accessCounts.DISABLED,
    concernCounts,
    repliesCount,
    recentActivity,
    openByOwner,
  };
}

export async function getAdminUsers({
  query,
  role,
}: {
  query: string;
  role: Role | "ALL";
}) {
  const db = getDb();
  const contains = { contains: query, mode: "insensitive" as const };

  return db.user.findMany({
    where: {
      ...(role !== "ALL" ? { role } : {}),
      ...(query
        ? {
            OR: [
              { name: contains },
              { email: contains },
              { studentNumber: contains },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      studentNumber: true,
      role: true,
      status: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { concerns: true, replies: true } },
    },
    orderBy: [{ status: "asc" }, { role: "asc" }, { name: "asc" }],
  });
}

export async function getAuditLogPage(pageInput: number) {
  const db = getDb();
  const total = await db.auditLog.count();
  const pageCount = Math.max(1, Math.ceil(total / ACTIVITY_PAGE_SIZE));
  const page = Math.min(pageInput, pageCount);

  const items = await db.auditLog.findMany({
    include: { actor: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ACTIVITY_PAGE_SIZE,
    take: ACTIVITY_PAGE_SIZE,
  });

  return { items, total, page, pageCount };
}
