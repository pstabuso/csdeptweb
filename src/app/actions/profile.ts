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
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect("/profile");
  }

  const db = getDb();
  const nextPassword = parsed.data.password?.trim();

  await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      ...(nextPassword
        ? {
            passwordHash: await bcrypt.hash(nextPassword, 12),
          }
        : {}),
    },
  });

  await createSession({
    userId: user.id,
    name: parsed.data.name,
    email: user.email,
    role: user.role,
  });

  await logActivity({
    actorId: user.id,
    action: nextPassword ? "PROFILE_AND_PASSWORD_UPDATED" : "PROFILE_UPDATED",
    entityType: "User",
    entityId: user.id,
    details: {
      role: user.role,
    },
  });

  revalidatePath("/profile");
  revalidatePath(getRoleHomePath(user.role));
  redirect("/profile");
}
