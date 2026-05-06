import "server-only";

import { Role, UserStatus } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getDb } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "csdept-session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: Role;
  sessionVersion: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not set.");
  }

  return new TextEncoder().encode(secret);
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());

    if (
      typeof payload.userId !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.sessionVersion !== "number"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role as Role,
      sessionVersion: payload.sessionVersion,
    };
  } catch {
    return null;
  }
});

export async function createSession(session: SessionPayload) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getAuthSecret());

  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export function getRoleHomePath(role: Role) {
  switch (role) {
    case Role.STUDENT:
      return "/student";
    case Role.COORDINATOR:
      return "/coordinator";
    case Role.SECRETARY:
      return "/secretary";
    case Role.ADMIN:
      return "/admin";
    default:
      return "/dashboard";
  }
}

export async function requireUser(allowedRoles?: Role[]) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect(getRoleHomePath(session.role));
  }

  const db = getDb();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      studentNumber: true,
      role: true,
      status: true,
      sessionVersion: true,
      createdAt: true,
    },
  });

  if (!user) {
    await clearSession();
    redirect("/login");
  }

  if (user.status === UserStatus.DISABLED) {
    await clearSession();
    redirect("/login");
  }

  if (user.sessionVersion !== session.sessionVersion) {
    await clearSession();
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect(getRoleHomePath(user.role));
  }

  return user;
}
