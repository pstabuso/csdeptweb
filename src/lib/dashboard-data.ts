import "server-only";

import { ConcernStatus, Role, UserStatus } from "@prisma/client";

import {
  CONCERN_SORT_OPTIONS,
  STUDENT_CONCERN_CATEGORIES,
} from "@/lib/constants";
import { getManilaMonthRange } from "@/lib/ph-time";
import { getDb } from "@/lib/prisma";

export type ConcernFilterState = {
  status: "ALL" | ConcernStatus;
  category: string;
  sort: (typeof CONCERN_SORT_OPTIONS)[number];
  query: string;
};

type DashboardSearchParams = {
  status?: string;
  category?: string;
  sort?: string;
  query?: string;
};

const concernStatusRank: Record<ConcernStatus, number> = {
  OPEN: 0,
  ANSWERED: 1,
  CLOSED: 2,
};

export function normalizeConcernFilters(
  params?: DashboardSearchParams,
): ConcernFilterState {
  const status =
    params?.status === "OPEN" ||
    params?.status === "ANSWERED" ||
    params?.status === "CLOSED"
      ? params.status
      : "ALL";
  const sort = CONCERN_SORT_OPTIONS.includes(
    (params?.sort as (typeof CONCERN_SORT_OPTIONS)[number]) ?? "recent",
  )
    ? ((params?.sort as (typeof CONCERN_SORT_OPTIONS)[number]) ?? "recent")
    : "recent";

  return {
    status,
    category: params?.category?.trim() || "ALL",
    sort,
    query: params?.query?.trim() || "",
  };
}

function buildConcernWhere(filters: ConcernFilterState) {
  const query = filters.query.trim();

  return {
    ...(filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.category !== "ALL" ? { category: filters.category } : {}),
    ...(query
      ? {
          OR: [
            {
              subject: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              message: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              student: {
                is: {
                  name: {
                    contains: query,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
              student: {
                is: {
                  email: {
                    contains: query,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
              student: {
                is: {
                  studentNumber: {
                    contains: query,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          ],
        }
      : {}),
  };
}

function sortConcerns<T extends { status: ConcernStatus; createdAt: Date; updatedAt: Date }>(
  concerns: T[],
  sort: ConcernFilterState["sort"],
) {
  return [...concerns].sort((left, right) => {
    if (sort === "oldest") {
      return left.createdAt.getTime() - right.createdAt.getTime();
    }

    if (sort === "newest") {
      return right.createdAt.getTime() - left.createdAt.getTime();
    }

    if (sort === "open-first") {
      const byStatus = concernStatusRank[left.status] - concernStatusRank[right.status];

      if (byStatus !== 0) {
        return byStatus;
      }
    }

    const byUpdated = right.updatedAt.getTime() - left.updatedAt.getTime();

    if (byUpdated !== 0) {
      return byUpdated;
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });
}

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
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return getDefaultScheduleMonth();
  }

  return value;
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

export async function getStudentDashboardData(studentId: string) {
  const db = getDb();

  return db.concern.findMany({
    where: { studentId },
    include: {
      replies: {
        include: {
          author: {
            select: {
              name: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getStaffDashboardData(filters: ConcernFilterState) {
  const db = getDb();
  const concerns = await db.concern.findMany({
    where: buildConcernWhere(filters),
    include: {
      student: {
        select: {
          name: true,
          email: true,
          studentNumber: true,
        },
      },
      replies: {
        include: {
          author: {
            select: {
              name: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return sortConcerns(concerns, filters.sort);
}

export async function getScheduleEntries(month: string) {
  const db = getDb();
  const range = getManilaMonthRange(month);

  return db.scheduleEntry.findMany({
    where: {
      startsAt: { lt: range.end },
      endsAt: { gt: range.start },
    },
    include: {
      createdBy: {
        select: {
          name: true,
          role: true,
        },
      },
    },
    orderBy: [{ startsAt: "asc" }, { endsAt: "asc" }],
  });
}

export async function getAdminDashboardData(filters: ConcernFilterState) {
  const db = getDb();

  const concernWhere = buildConcernWhere(filters);

  const [
    totalUsers,
    totalConcerns,
    openConcerns,
    answeredConcerns,
    closedConcerns,
    repliesCount,
    concerns,
    auditLogs,
    users,
    activeUsers,
    disabledUsers,
  ] = await Promise.all([
    db.user.count(),
    db.concern.count(),
    db.concern.count({ where: { status: ConcernStatus.OPEN } }),
    db.concern.count({ where: { status: ConcernStatus.ANSWERED } }),
    db.concern.count({ where: { status: ConcernStatus.CLOSED } }),
    db.concernReply.count(),
    db.concern.findMany({
      where: concernWhere,
      include: {
        student: {
          select: {
            name: true,
            email: true,
            studentNumber: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    }),
    db.auditLog.findMany({
      include: {
        actor: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 14,
    }),
    db.user.findMany({
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
        _count: {
          select: {
            concerns: true,
            replies: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { role: "asc" }, { createdAt: "asc" }],
    }),
    db.user.count({ where: { status: UserStatus.ACTIVE } }),
    db.user.count({ where: { status: UserStatus.DISABLED } }),
  ]);

  const roleCounts = users.reduce(
    (accumulator, user) => {
      accumulator[user.role] += 1;
      return accumulator;
    },
    {
      [Role.STUDENT]: 0,
      [Role.COORDINATOR]: 0,
      [Role.SECRETARY]: 0,
      [Role.ADMIN]: 0,
    },
  );

  return {
    stats: {
      totalUsers,
      activeUsers,
      disabledUsers,
      totalConcerns,
      openConcerns,
      answeredConcerns,
      closedConcerns,
      repliesCount,
    },
    roleCounts,
    concerns: sortConcerns(concerns, filters.sort),
    auditLogs,
    users,
  };
}
