"use server";

import { ConcernStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { concernSchema, replySchema } from "@/lib/validation";

export async function createConcern(formData: FormData) {
  const user = await requireUser([Role.STUDENT]);
  const parsed = concernSchema.safeParse({
    subject: formData.get("subject"),
    category: formData.get("category"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    redirect("/student");
  }

  const db = getDb();
  const concern = await db.concern.create({
    data: {
      ...parsed.data,
      studentId: user.id,
    },
  });

  await logActivity({
    actorId: user.id,
    action: "CONCERN_CREATED",
    entityType: "Concern",
    entityId: concern.id,
    details: {
      subject: concern.subject,
      category: concern.category,
    },
  });

  revalidatePath("/student");
  revalidatePath("/coordinator");
  revalidatePath("/secretary");
  revalidatePath("/admin");
  redirect("/student");
}

export async function replyToConcern(concernId: string, formData: FormData) {
  const user = await requireUser([Role.COORDINATOR, Role.SECRETARY]);
  const parsed = replySchema.safeParse({
    message: formData.get("message"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    redirect(user.role === Role.COORDINATOR ? "/coordinator" : "/secretary");
  }

  const db = getDb();
  const concern = await db.concern.findUnique({
    where: { id: concernId },
    select: {
      id: true,
      subject: true,
      status: true,
    },
  });

  if (!concern) {
    redirect(user.role === Role.COORDINATOR ? "/coordinator" : "/secretary");
  }

  await db.concernReply.create({
    data: {
      concernId: concern.id,
      authorId: user.id,
      message: parsed.data.message,
    },
  });

  await db.concern.update({
    where: { id: concern.id },
    data: {
      status: parsed.data.status as ConcernStatus,
      lastRespondedAt: new Date(),
    },
  });

  await logActivity({
    actorId: user.id,
    action: "CONCERN_REPLIED",
    entityType: "Concern",
    entityId: concern.id,
    details: {
      status: parsed.data.status,
      subject: concern.subject,
    },
  });

  revalidatePath("/student");
  revalidatePath("/coordinator");
  revalidatePath("/secretary");
  revalidatePath("/admin");
  redirect(user.role === Role.COORDINATOR ? "/coordinator" : "/secretary");
}

