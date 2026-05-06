"use server";

import { Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { clearSession, createSession, getRoleHomePath } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import {
  getLockoutExpiry,
  LOGIN_ATTEMPT_LIMIT,
  LOGIN_LOCKOUT_MINUTES,
} from "@/lib/security";
import { loginSchema, signupSchema } from "@/lib/validation";

export type LoginActionState = {
  error?: string;
};

export async function login(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const invalidCredentialsError = "No account matches that email and password.";
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials." };
  }

  const db = getDb();
  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user) {
    return { error: invalidCredentialsError };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await logActivity({
      actorId: user.id,
      action: "LOGIN_LOCKED_OUT",
      entityType: "User",
      entityId: user.id,
      details: {
        email: user.email,
        lockedUntil: user.lockedUntil.toISOString(),
      },
    });

    return {
      error: `Too many sign-in attempts. Try again in ${LOGIN_LOCKOUT_MINUTES} minutes.`,
    };
  }

  if (user.lockedUntil || user.failedLoginAttempts > 0) {
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  const passwordMatches = await bcrypt.compare(
    parsed.data.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    const shouldLock = failedLoginAttempts >= LOGIN_ATTEMPT_LIMIT;
    const lockoutExpiry = shouldLock ? getLockoutExpiry() : null;

    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts,
        lockedUntil: lockoutExpiry,
      },
    });

    await logActivity({
      actorId: user.id,
      action: "LOGIN_FAILED",
      entityType: "User",
      entityId: user.id,
      details: {
        email: user.email,
        failedLoginAttempts,
        lockedUntil: lockoutExpiry?.toISOString() ?? null,
      },
    });

    return {
      error: shouldLock
        ? `Too many sign-in attempts. Try again in ${LOGIN_LOCKOUT_MINUTES} minutes.`
        : invalidCredentialsError,
    };
  }

  if (user.status === UserStatus.DISABLED) {
    await logActivity({
      actorId: user.id,
      action: "LOGIN_DISABLED_ACCOUNT",
      entityType: "User",
      entityId: user.id,
      details: {
        email: user.email,
      },
    });

    return {
      error:
        "This account has been disabled. Please contact the department administrator.",
    };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    sessionVersion: user.sessionVersion,
  });

  await logActivity({
    actorId: user.id,
    action: "LOGIN_SUCCESS",
    entityType: "User",
    entityId: user.id,
    details: { role: user.role },
  });

  redirect(getRoleHomePath(user.role));
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
    studentNumber: formData.get("studentNumber"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid sign-up data." };
  }

  const db = getDb();
  const normalizedEmail = parsed.data.email.toLowerCase();
  const normalizedStudentNumber = parsed.data.studentNumber.trim();
  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return { error: "An account with that email already exists." };
  }

  const duplicateStudentNumber = await db.user.findFirst({
    where: {
      studentNumber: normalizedStudentNumber,
    },
    select: {
      id: true,
    },
  });

  if (duplicateStudentNumber) {
    return { error: "That student number is already registered." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: normalizedEmail,
      studentNumber: normalizedStudentNumber,
      passwordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    sessionVersion: user.sessionVersion,
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
