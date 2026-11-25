"use server";

import { ConcernStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/activity";
import { requireUser } from "@/lib/auth";
import { withNotice } from "@/lib/notices";
import { getDb } from "@/lib/prisma";
import { getConcernListPath, getConcernPath } from "@/lib/routes";
import {
  concernSchema,
  concernStatusSchema,
  replySchema,
  studentProfileSchema,
  studentReplySchema,
} from "@/lib/validation";

function revalidateConcernViews() {
  revalidatePath("/student", "layout");
  revalidatePath("/coordinator", "layout");
  revalidatePath("/secretary", "layout");
  revalidatePath("/admin", "layout");
}

export async function createConcern(formData: FormData) {
  const user = await requireUser([Role.STUDENT]);

  if (!user.studentNumber) {
    await logActivity({
      actorId: user.id,
      action: "CONCERN_BLOCKED_MISSING_STUDENT_NUMBER",
      entityType: "Concern",
      entityId: null,
      details: { email: user.email },
    });

    redirect(withNotice("/student", "student-number-required"));
  }

  const parsed = concernSchema.safeParse({
    subject: formData.get("subject"),
    category: formData.get("category"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    redirect(withNotice("/student/concerns/new", "concern-invalid"));
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

  revalidateConcernViews();
  redirect(withNotice(getConcernPath(Role.STUDENT, concern.id), "concern-created"));
}

/**
 * Adds a message to a concern thread.
 * - Staff replies set the status chosen in the form (default: Answered).
 * - Student follow-ups move the concern back to Open so it reappears
 *   in the staff "Needs reply" list.
 */
export async function replyToConcern(concernId: string, formData: FormData) {
  const user = await requireUser([Role.STUDENT, Role.COORDINATOR, Role.SECRETARY]);
  const db = getDb();
  const detailPath = getConcernPath(user.role, concernId);

  const concern = await db.concern.findUnique({
    where: { id: concernId },
    select: { id: true, subject: true, status: true, studentId: true },
  });

  if (!concern || (user.role === Role.STUDENT && concern.studentId !== user.id)) {
    redirect(withNotice(getConcernListPath(user.role), "not-found"));
  }

  if (user.role === Role.STUDENT) {
    if (concern.status === ConcernStatus.CLOSED) {
      redirect(withNotice(detailPath, "concern-locked"));
    }

    const parsed = studentReplySchema.safeParse({ message: formData.get("message") });

    if (!parsed.success) {
      redirect(withNotice(detailPath, "reply-invalid"));
    }

    await db.$transaction([
      db.concernReply.create({
        data: { concernId: concern.id, authorId: user.id, message: parsed.data.message },
      }),
      db.concern.update({
        where: { id: concern.id },
        data: { status: ConcernStatus.OPEN },
      }),
    ]);

    await logActivity({
      actorId: user.id,
      action: "CONCERN_FOLLOW_UP",
      entityType: "Concern",
      entityId: concern.id,
      details: { subject: concern.subject },
    });
  } else {
    const parsed = replySchema.safeParse({
      message: formData.get("message"),
      status: formData.get("status"),
    });

    if (!parsed.success) {
      redirect(withNotice(detailPath, "reply-invalid"));
    }

    await db.$transaction([
      db.concernReply.create({
        data: { concernId: concern.id, authorId: user.id, message: parsed.data.message },
      }),
      db.concern.update({
        where: { id: concern.id },
        data: {
          status: parsed.data.status as ConcernStatus,
          lastRespondedAt: new Date(),
        },
      }),
    ]);

    await logActivity({
      actorId: user.id,
      action: "CONCERN_REPLIED",
      entityType: "Concern",
      entityId: concern.id,
      details: { status: parsed.data.status, subject: concern.subject },
    });
  }

  revalidateConcernViews();
  redirect(withNotice(detailPath, "reply-sent"));
}

/**
 * Close or reopen a concern without writing a reply.
 * Students may only close their own concern ("Mark as resolved").
 */
export async function updateConcernStatus(concernId: string, formData: FormData) {
  const user = await requireUser([Role.STUDENT, Role.COORDINATOR, Role.SECRETARY]);
  const db = getDb();
  const detailPath = getConcernPath(user.role, concernId);
  const parsed = concernStatusSchema.safeParse({ status: formData.get("status") });

  if (!parsed.success) {
    redirect(detailPath);
  }

  const concern = await db.concern.findUnique({
    where: { id: concernId },
    select: { id: true, subject: true, status: true, studentId: true },
  });

  if (!concern || (user.role === Role.STUDENT && concern.studentId !== user.id)) {
    redirect(withNotice(getConcernListPath(user.role), "not-found"));
  }

  const nextStatus = parsed.data.status as ConcernStatus;

  if (user.role === Role.STUDENT && nextStatus !== ConcernStatus.CLOSED) {
    redirect(withNotice(detailPath, "concern-locked"));
  }

  if (concern.status !== nextStatus) {
    await db.concern.update({
      where: { id: concern.id },
      data: { status: nextStatus },
    });

    await logActivity({
      actorId: user.id,
      action: nextStatus === ConcernStatus.CLOSED ? "CONCERN_CLOSED" : "CONCERN_REOPENED",
      entityType: "Concern",
      entityId: concern.id,
      details: { subject: concern.subject, previousStatus: concern.status },
    });

    revalidateConcernViews();
  }

  redirect(
    withNotice(
      detailPath,
      nextStatus === ConcernStatus.CLOSED ? "concern-closed" : "concern-reopened",
    ),
  );
}

export async function updateStudentNumber(formData: FormData) {
  const user = await requireUser([Role.STUDENT]);
  const parsed = studentProfileSchema.safeParse({
    studentNumber: formData.get("studentNumber"),
  });

  if (!parsed.success) {
    redirect(withNotice("/student", "student-number-invalid"));
  }

  const db = getDb();
  const normalizedStudentNumber = parsed.data.studentNumber.trim();
  const duplicateUser = await db.user.findFirst({
    where: {
      studentNumber: normalizedStudentNumber,
      id: { not: user.id },
    },
    select: { id: true },
  });

  if (duplicateUser) {
    redirect(withNotice("/student", "student-number-taken"));
  }

  await db.user.update({
    where: { id: user.id },
    data: { studentNumber: normalizedStudentNumber },
  });

  await logActivity({
    actorId: user.id,
    action: "STUDENT_NUMBER_UPDATED",
    entityType: "User",
    entityId: user.id,
    details: { studentNumber: normalizedStudentNumber },
  });

  revalidatePath("/student", "layout");
  revalidatePath("/admin", "layout");
  redirect(withNotice("/student", "student-number-saved"));
}
