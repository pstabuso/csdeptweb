"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { clearSession, createSession, getRoleHomePath } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

export type LoginActionState = {
  error?: string;
};

export async function login(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials." };
  }

  const db = getDb();
  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user) {
    return { error: "No account matches that email and password." };
  }

  const passwordMatches = await bcrypt.compare(
    parsed.data.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    await logActivity({
      actorId: user.id,
      action: "LOGIN_FAILED",
      entityType: "User",
      entityId: user.id,
      details: { email: user.email },
    });

    return { error: "No account matches that email and password." };
  }

  if (user.role !== parsed.data.role) {
    await logActivity({
      actorId: user.id,
      action: "LOGIN_ROLE_MISMATCH",
      entityType: "User",
      entityId: user.id,
      details: {
        email: user.email,
        selectedRole: parsed.data.role,
        actualRole: user.role,
      },
    });

    return {
      error:
        "That account exists, but it is not assigned to the role you selected.",
    };
  }

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: parsed.data.role,
  });

  await logActivity({
    actorId: user.id,
    action: "LOGIN_SUCCESS",
    entityType: "User",
    entityId: user.id,
    details: { role: parsed.data.role },
  });

  redirect(getRoleHomePath(parsed.data.role));
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
