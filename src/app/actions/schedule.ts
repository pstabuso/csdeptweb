"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { requireUser } from "@/lib/auth";
import { parseManilaDateTimeLocal } from "@/lib/ph-time";
import { getDb } from "@/lib/prisma";
import { withNotice } from "@/lib/notices";
import { sanitizeRedirectPath } from "@/lib/security";
import { scheduleEntrySchema } from "@/lib/validation";

// The secretary owns the department calendar. Everyone else can view it.
const writableRoles = [Role.SECRETARY];
const CALENDAR_FALLBACK = "/secretary/calendar";

function revalidateScheduleViews() {
  revalidatePath("/student", "layout");
  revalidatePath("/coordinator", "layout");
  revalidatePath("/secretary", "layout");
  revalidatePath("/admin", "layout");
}

function getRedirectTarget(formData: FormData) {
  return sanitizeRedirectPath(
    String(formData.get("redirectTo") || CALENDAR_FALLBACK),
    CALENDAR_FALLBACK,
  );
}

export async function createScheduleEntry(formData: FormData) {
  const user = await requireUser(writableRoles);
  const redirectTo = getRedirectTarget(formData);
  const parsed = scheduleEntrySchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    notes: formData.get("notes"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });

  if (!parsed.success) {
    redirect(withNotice(redirectTo, "schedule-invalid"));
  }

  const startsAt = parseManilaDateTimeLocal(parsed.data.startsAt);
  const endsAt = parseManilaDateTimeLocal(parsed.data.endsAt);

  if (!startsAt || !endsAt) {
    redirect(withNotice(redirectTo, "schedule-invalid"));
  }

  const db = getDb();
  const entry = await db.scheduleEntry.create({
    data: {
      title: parsed.data.title,
      location: parsed.data.location,
      notes: parsed.data.notes?.trim() || null,
      startsAt,
      endsAt,
      createdById: user.id,
    },
  });

  await logActivity({
    actorId: user.id,
    action: "SCHEDULE_ENTRY_CREATED",
    entityType: "ScheduleEntry",
    entityId: entry.id,
    details: {
      title: entry.title,
      location: entry.location,
    },
  });

  revalidateScheduleViews();
  redirect(withNotice(redirectTo, "schedule-saved"));
}

export async function updateScheduleEntry(entryId: string, formData: FormData) {
  const user = await requireUser(writableRoles);
  const redirectTo = getRedirectTarget(formData);
  const parsed = scheduleEntrySchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    notes: formData.get("notes"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });

  if (!parsed.success) {
    redirect(withNotice(redirectTo, "schedule-invalid"));
  }

  const startsAt = parseManilaDateTimeLocal(parsed.data.startsAt);
  const endsAt = parseManilaDateTimeLocal(parsed.data.endsAt);

  if (!startsAt || !endsAt) {
    redirect(withNotice(redirectTo, "schedule-invalid"));
  }

  const db = getDb();
  const entry = await db.scheduleEntry.update({
    where: { id: entryId },
    data: {
      title: parsed.data.title,
      location: parsed.data.location,
      notes: parsed.data.notes?.trim() || null,
      startsAt,
      endsAt,
    },
  });

  await logActivity({
    actorId: user.id,
    action: "SCHEDULE_ENTRY_UPDATED",
    entityType: "ScheduleEntry",
    entityId: entry.id,
    details: {
      title: entry.title,
      location: entry.location,
    },
  });

  revalidateScheduleViews();
  redirect(withNotice(redirectTo, "schedule-saved"));
}

export async function deleteScheduleEntry(entryId: string, formData: FormData) {
  const user = await requireUser(writableRoles);
  const redirectTo = getRedirectTarget(formData);
  const db = getDb();

  const existingEntry = await db.scheduleEntry.findUnique({
    where: { id: entryId },
    select: {
      id: true,
      title: true,
      location: true,
    },
  });

  if (!existingEntry) {
    redirect(redirectTo);
  }

  await db.scheduleEntry.delete({
    where: { id: existingEntry.id },
  });

  await logActivity({
    actorId: user.id,
    action: "SCHEDULE_ENTRY_DELETED",
    entityType: "ScheduleEntry",
    entityId: existingEntry.id,
    details: {
      title: existingEntry.title,
      location: existingEntry.location,
    },
  });

  revalidateScheduleViews();
  redirect(withNotice(redirectTo, "schedule-deleted"));
}
