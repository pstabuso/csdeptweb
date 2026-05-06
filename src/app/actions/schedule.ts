"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { sanitizeRedirectPath } from "@/lib/security";
import { scheduleEntrySchema } from "@/lib/validation";

const writableRoles = [Role.COORDINATOR, Role.SECRETARY];

function parsePhilippineDateTime(value: string) {
  return new Date(`${value}:00+08:00`);
}

function revalidateScheduleViews() {
  revalidatePath("/student");
  revalidatePath("/coordinator");
  revalidatePath("/secretary");
  revalidatePath("/admin");
}

export async function createScheduleEntry(formData: FormData) {
  const user = await requireUser(writableRoles);
  const redirectTo = sanitizeRedirectPath(
    String(formData.get("redirectTo") || "/coordinator"),
    user.role === Role.COORDINATOR ? "/coordinator" : "/secretary",
  );
  const parsed = scheduleEntrySchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    notes: formData.get("notes"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });

  if (!parsed.success) {
    redirect(redirectTo);
  }

  const db = getDb();
  const entry = await db.scheduleEntry.create({
    data: {
      title: parsed.data.title,
      location: parsed.data.location,
      notes: parsed.data.notes?.trim() || null,
      startsAt: parsePhilippineDateTime(parsed.data.startsAt),
      endsAt: parsePhilippineDateTime(parsed.data.endsAt),
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
  redirect(redirectTo);
}

export async function updateScheduleEntry(entryId: string, formData: FormData) {
  const user = await requireUser(writableRoles);
  const redirectTo = sanitizeRedirectPath(
    String(formData.get("redirectTo") || "/coordinator"),
    user.role === Role.COORDINATOR ? "/coordinator" : "/secretary",
  );
  const parsed = scheduleEntrySchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    notes: formData.get("notes"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });

  if (!parsed.success) {
    redirect(redirectTo);
  }

  const db = getDb();
  const entry = await db.scheduleEntry.update({
    where: { id: entryId },
    data: {
      title: parsed.data.title,
      location: parsed.data.location,
      notes: parsed.data.notes?.trim() || null,
      startsAt: parsePhilippineDateTime(parsed.data.startsAt),
      endsAt: parsePhilippineDateTime(parsed.data.endsAt),
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
  redirect(redirectTo);
}

export async function deleteScheduleEntry(entryId: string, formData: FormData) {
  const user = await requireUser(writableRoles);
  const redirectTo = sanitizeRedirectPath(
    String(formData.get("redirectTo") || "/coordinator"),
    user.role === Role.COORDINATOR ? "/coordinator" : "/secretary",
  );
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
  redirect(redirectTo);
}
