"use server";

import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { clearSession, createSession, getRoleHomePath } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { loginSchema, signupSchema } from "@/lib/validation";

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

export type SignupActionState = {
  error?: string;
};

export async function signup(
  _previousState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid sign-up data." };
  }

  const db = getDb();
  const normalizedEmail = parsed.data.email.toLowerCase();
  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: normalizedEmail,
      passwordHash,
      role: Role.STUDENT,
    },
  });

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  await logActivity({
    actorId: user.id,
    action: "ACCOUNT_CREATED",
    entityType: "User",
    entityId: user.id,
    details: {
      role: user.role,
      email: user.email,
    },
  });

  redirect(getRoleHomePath(user.role));
}
