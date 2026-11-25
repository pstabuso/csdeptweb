/**
 * Flash notices.
 *
 * Server actions redirect back with `?notice=<code>` so the next page can tell
 * the user what happened. Previously every validation failure redirected
 * silently, which made forms feel broken.
 */
export const NOTICES = {
  "concern-created": { tone: "success", text: "Concern submitted. You'll see staff replies here." },
  "concern-invalid": { tone: "error", text: "Add a type, a subject of 5+ characters, and details of 15+ characters." },
  "student-number-required": { tone: "error", text: "Save your student number before submitting a concern." },
  "reply-sent": { tone: "success", text: "Reply sent." },
  "reply-invalid": { tone: "error", text: "Your reply is too short." },
  "concern-closed": { tone: "success", text: "Concern closed." },
  "concern-reopened": { tone: "success", text: "Concern reopened." },
  "concern-locked": { tone: "error", text: "This concern is closed. Submit a new concern if you still need help." },
  "not-found": { tone: "error", text: "That concern could not be found." },
  "student-number-saved": { tone: "success", text: "Student number saved. You can now submit concerns." },
  "student-number-invalid": { tone: "error", text: "Student numbers need at least 5 characters." },
  "student-number-taken": { tone: "error", text: "That student number is already registered to another account." },
  "schedule-saved": { tone: "success", text: "Calendar entry saved." },
  "schedule-deleted": { tone: "success", text: "Calendar entry deleted." },
  "schedule-invalid": { tone: "error", text: "Check the entry: it needs a title, a location, and an end time later the same day." },
  "user-saved": { tone: "success", text: "Account updated." },
  "user-invalid": { tone: "error", text: "Check the account form and try again." },
  "user-email-taken": { tone: "error", text: "Another account already uses that email." },
  "user-student-number-taken": { tone: "error", text: "Another account already uses that student number." },
  "self-change-blocked": { tone: "error", text: "You can't change your own role or access." },
} as const satisfies Record<string, { tone: "success" | "error"; text: string }>;

export type NoticeCode = keyof typeof NOTICES;

export function getNotice(code: string | undefined | null) {
  if (!code || !(code in NOTICES)) {
    return null;
  }

  return NOTICES[code as NoticeCode];
}

/** Adds (or replaces) the `notice` query param on an internal path. */
export function withNotice(path: string, code: NoticeCode) {
  const url = new URL(path, "http://internal.local");
  url.searchParams.set("notice", code);

  return `${url.pathname}${url.search}${url.hash}`;
}
