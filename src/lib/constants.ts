export const STUDENT_CONCERN_CATEGORIES = [
  "COR Revision",
  "Readmission",
  "Grade/INC Completion",
  "Thesis Consultation",
  "Others",
] as const;

export type ConcernCategory = (typeof STUDENT_CONCERN_CATEGORIES)[number];

/**
 * Which staff role handles which concern category by default.
 * Both roles can still open and answer any concern; their queue simply
 * defaults to "Mine" so they see their own categories first.
 */
export const STAFF_CATEGORY_OWNERSHIP = {
  COORDINATOR: ["Thesis Consultation", "Grade/INC Completion", "Readmission"],
  SECRETARY: ["COR Revision", "Others"],
} as const satisfies Record<"COORDINATOR" | "SECRETARY", readonly ConcernCategory[]>;

export type StaffRole = keyof typeof STAFF_CATEGORY_OWNERSHIP;

export function getCategoryOwner(category: string): StaffRole {
  return (STAFF_CATEGORY_OWNERSHIP.COORDINATOR as readonly string[]).includes(category)
    ? "COORDINATOR"
    : "SECRETARY";
}

export const CONCERN_SORT_OPTIONS = [
  "recent",
  "newest",
  "oldest",
  "open-first",
] as const;

export const CONCERN_SORT_LABELS: Record<(typeof CONCERN_SORT_OPTIONS)[number], string> = {
  "open-first": "Needs reply first",
  recent: "Recently updated",
  newest: "Newest",
  oldest: "Oldest",
};

export const QUEUE_PAGE_SIZE = 20;
export const ACTIVITY_PAGE_SIZE = 30;
