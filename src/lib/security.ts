import { Role } from "@prisma/client";

export const LOGIN_ATTEMPT_LIMIT = 5;
export const LOGIN_LOCKOUT_MINUTES = 15;

const ROLE_HOME_PATHS: Record<Role, string> = {
  STUDENT: "/student",
  COORDINATOR: "/coordinator",
  SECRETARY: "/secretary",
  ADMIN: "/admin",
};

const SAFE_REDIRECT_PREFIXES = [
  "/student",
  "/coordinator",
  "/secretary",
  "/admin",
  "/profile",
  "/dashboard",
] as const;

export function sanitizeRedirectPath(
  input: string | null | undefined,
  fallback: string,
) {
  if (!input) {
    return fallback;
  }

  if (!input.startsWith("/") || input.startsWith("//")) {
    return fallback;
  }

  const isSafePath = SAFE_REDIRECT_PREFIXES.some(
    (prefix) =>
      input === prefix ||
      input.startsWith(`${prefix}/`) ||
      input.startsWith(`${prefix}?`),
  );

  if (!isSafePath) {
    return fallback;
  }

  return input;
}

export function getLockoutExpiry() {
  return new Date(Date.now() + LOGIN_LOCKOUT_MINUTES * 60 * 1000);
}

export function getRoleNavigation(role: Role) {
  const workspaceLabel =
    role === Role.STUDENT
      ? "My Desk"
      : role === Role.ADMIN
        ? "Control"
        : "Queue";

  return [
    {
      label: workspaceLabel,
      href: ROLE_HOME_PATHS[role],
      description:
        role === Role.STUDENT
          ? "Concerns and updates"
          : role === Role.ADMIN
            ? "System overview"
            : "Live concern handling",
    },
    {
      label: "Profile",
      href: "/profile",
      description: "Account and password",
    },
  ];
}
