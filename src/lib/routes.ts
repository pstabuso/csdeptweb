import { Role } from "@prisma/client";

export const ROLE_BASE_PATHS: Record<Role, string> = {
  STUDENT: "/student",
  COORDINATOR: "/coordinator",
  SECRETARY: "/secretary",
  ADMIN: "/admin",
};

export function getRoleBasePath(role: Role) {
  return ROLE_BASE_PATHS[role];
}

/** Where a given role reads a single concern thread. */
export function getConcernPath(role: Role, concernId: string) {
  return `${ROLE_BASE_PATHS[role]}/concerns/${concernId}`;
}

/** Where a given role sees its list of concerns. */
export function getConcernListPath(role: Role) {
  if (role === Role.COORDINATOR || role === Role.SECRETARY) {
    return ROLE_BASE_PATHS[role];
  }

  return `${ROLE_BASE_PATHS[role]}/concerns`;
}

export function getCalendarPath(role: Role) {
  return `${ROLE_BASE_PATHS[role]}/calendar`;
}
