"use server";

import { Role, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { accessUpdateSchema } from "@/lib/validation";

export async function updateUserAccess(userId: string, formData: FormData) {
  const admin = await requireUser([Role.ADMIN]);
  const parsed = accessUpdateSchema.safeParse({
    role: formData.get("role"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    redirect("/admin");
  }

  const db = getDb();
  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!existingUser) {
    redirect("/admin");
  }

  if (existingUser.id === admin.id) {
    if (
      parsed.data.role !== existingUser.role ||
      parsed.data.status !== existingUser.status
    ) {
      await logActivity({
        actorId: admin.id,
        action: "ADMIN_SELF_ACCESS_CHANGE_BLOCKED",
        entityType: "User",
        entityId: existingUser.id,
        details: {
          targetEmail: existingUser.email,
        },
      });
    }

    redirect("/admin");
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      role: parsed.data.role as Role,
      status: parsed.data.status as UserStatus,
    },
  });

  await logActivity({
    actorId: admin.id,
    action: "USER_ACCESS_UPDATED",
    entityType: "User",
    entityId: existingUser.id,
    details: {
      targetEmail: existingUser.email,
      previousRole: existingUser.role,
      nextRole: parsed.data.role,
      previousStatus: existingUser.status,
      nextStatus: parsed.data.status,
    },
  });

  revalidatePath("/admin");
  redirect("/admin");
}
