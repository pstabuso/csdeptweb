import "server-only";

import { ConcernStatus, Role } from "@prisma/client";

import { getDb } from "@/lib/prisma";

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

export async function getStaffDashboardData() {
  const db = getDb();

  return db.concern.findMany({
    include: {
      student: {
        select: {
          name: true,
          email: true,
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
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAdminDashboardData() {
  const db = getDb();

  const [
    totalUsers,
    totalConcerns,
    openConcerns,
    answeredConcerns,
    closedConcerns,
    repliesCount,
    recentConcerns,
    auditLogs,
    users,
  ] = await Promise.all([
    db.user.count(),
    db.concern.count(),
    db.concern.count({ where: { status: ConcernStatus.OPEN } }),
    db.concern.count({ where: { status: ConcernStatus.ANSWERED } }),
    db.concern.count({ where: { status: ConcernStatus.CLOSED } }),
    db.concernReply.count(),
    db.concern.findMany({
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 6,
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
        role: true,
      },
    }),
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
      totalConcerns,
      openConcerns,
      answeredConcerns,
      closedConcerns,
      repliesCount,
    },
    roleCounts,
    recentConcerns,
    auditLogs,
  };
}

