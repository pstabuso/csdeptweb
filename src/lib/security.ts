export const LOGIN_ATTEMPT_LIMIT = 5;
export const LOGIN_LOCKOUT_MINUTES = 15;

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
