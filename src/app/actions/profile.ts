"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { createSession, getRoleHomePath, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validation";

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const parsed = profileUpdateSchema.safeParse({
    name: formData.get("name"),
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect("/profile?status=invalid");
  }

  const db = getDb();
  const nextPassword = parsed.data.password?.trim();
  const currentPassword = parsed.data.currentPassword?.trim();

  const existingUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      role: true,
      sessionVersion: true,
      passwordHash: true,
    },
  });

  if (!existingUser) {
    redirect("/login");
  }

  if (nextPassword) {
    const currentPasswordMatches = await bcrypt.compare(
      currentPassword ?? "",
      existingUser.passwordHash,
    );

    if (!currentPasswordMatches) {
      await logActivity({
        actorId: user.id,
        action: "PASSWORD_CHANGE_REJECTED",
        entityType: "User",
        entityId: user.id,
        details: {
          reason: "INVALID_CURRENT_PASSWORD",
        },
      });

      redirect("/profile?status=password");
    }
  }

  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      ...(nextPassword
        ? {
            passwordHash: await bcrypt.hash(nextPassword, 12),
            sessionVersion: {
              increment: 1,
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sessionVersion: true,
    },
  });

  await createSession({
    userId: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    sessionVersion: updatedUser.sessionVersion,
  });

  await logActivity({
    actorId: user.id,
    action: nextPassword ? "PROFILE_AND_PASSWORD_UPDATED" : "PROFILE_UPDATED",
    entityType: "User",
    entityId: user.id,
    details: {
      role: updatedUser.role,
    },
  });

  revalidatePath("/profile");
  revalidatePath(getRoleHomePath(updatedUser.role));
  redirect("/profile?status=saved");
}
