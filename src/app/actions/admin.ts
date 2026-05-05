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
    name: formData.get("name"),
    email: formData.get("email"),
    studentNumber: formData.get("studentNumber"),
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
      studentNumber: true,
      role: true,
      status: true,
    },
  });

  if (!existingUser) {
    redirect("/admin");
  }

  const normalizedEmail = parsed.data.email.toLowerCase();
  const normalizedStudentNumber = parsed.data.studentNumber?.trim() || null;

  const duplicateEmailUser = await db.user.findFirst({
    where: {
      email: normalizedEmail,
      id: {
        not: existingUser.id,
      },
    },
    select: { id: true },
  });

  if (duplicateEmailUser) {
    redirect("/admin");
  }

  if (normalizedStudentNumber) {
    const duplicateStudentNumberUser = await db.user.findFirst({
      where: {
        studentNumber: normalizedStudentNumber,
        id: {
          not: existingUser.id,
        },
      },
      select: { id: true },
    });

    if (duplicateStudentNumberUser) {
      redirect("/admin");
    }
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      name: parsed.data.name,
      email: normalizedEmail,
      studentNumber: normalizedStudentNumber,
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
      nextEmail: normalizedEmail,
      previousName: existingUser.name,
      nextName: parsed.data.name,
      previousStudentNumber: existingUser.studentNumber,
      nextStudentNumber: normalizedStudentNumber,
      previousRole: existingUser.role,
      nextRole: parsed.data.role,
      previousStatus: existingUser.status,
      nextStatus: parsed.data.status,
    },
  });

  revalidatePath("/admin");
  redirect("/admin");
}
