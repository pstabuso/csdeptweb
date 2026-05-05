import "server-only";

import { getDb } from "@/lib/prisma";

type ActivityInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, string | number | boolean | null | undefined>;
};

export async function logActivity({
  actorId,
  action,
  entityType,
  entityId,
  details,
}: ActivityInput) {
  const db = getDb();
  const serializedDetails = details
    ? Object.fromEntries(
        Object.entries(details).filter(([, value]) => value !== undefined),
      )
    : undefined;

  await db.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      details: serializedDetails,
    },
  });
}
