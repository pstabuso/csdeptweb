import { ConcernStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

import { getDb } from "../src/lib/prisma";

async function main() {
  const db = getDb();
  const defaultPassword = "Password123!";
  const adminEmail = process.env.ADMIN_EMAIL?.trim() || "admin@csdept.edu";
  const adminName = process.env.ADMIN_NAME?.trim() || "Alex Admin";
  const adminPassword = process.env.ADMIN_PASSWORD?.trim() || defaultPassword;

  const passwordHash = await bcrypt.hash(defaultPassword, 12);
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const users = await Promise.all([
    db.user.upsert({
      where: { email: "student@csdept.edu" },
      update: {
        name: "Pat Student",
        passwordHash,
        role: Role.STUDENT,
      },
      create: {
        name: "Pat Student",
        email: "student@csdept.edu",
        passwordHash,
        role: Role.STUDENT,
      },
    }),
    db.user.upsert({
      where: { email: "coordinator@csdept.edu" },
      update: {
        name: "Casey Coordinator",
        passwordHash,
        role: Role.COORDINATOR,
      },
      create: {
        name: "Casey Coordinator",
        email: "coordinator@csdept.edu",
        passwordHash,
        role: Role.COORDINATOR,
      },
    }),
    db.user.upsert({
      where: { email: "secretary@csdept.edu" },
      update: {
        name: "Sam Secretary",
        passwordHash,
        role: Role.SECRETARY,
      },
      create: {
        name: "Sam Secretary",
        email: "secretary@csdept.edu",
        passwordHash,
        role: Role.SECRETARY,
      },
    }),
    db.user.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
        passwordHash: adminPasswordHash,
        role: Role.ADMIN,
      },
      create: {
        name: adminName,
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: Role.ADMIN,
      },
    }),
  ]);

  const student = users.find((user) => user.role === Role.STUDENT);
  const coordinator = users.find((user) => user.role === Role.COORDINATOR);
  const secretary = users.find((user) => user.role === Role.SECRETARY);
  const admin = users.find((user) => user.role === Role.ADMIN);

  if (!student || !coordinator || !secretary || !admin) {
    throw new Error("Seed users could not be created.");
  }

  await db.concernReply.deleteMany();
  await db.concern.deleteMany();
  await db.auditLog.deleteMany();

  const labConcern = await db.concern.create({
    data: {
      subject: "Request for laboratory make-up schedule",
      category: "Laboratory",
      message:
        "I missed the database systems laboratory because of a medical appointment. May I request a make-up schedule for this week?",
      status: ConcernStatus.ANSWERED,
      studentId: student.id,
      lastRespondedAt: new Date(),
      replies: {
        create: {
          authorId: coordinator.id,
          message:
            "Please upload your medical certificate to the department office email. We can place you in Friday's make-up slot once verified.",
        },
      },
    },
  });

  const clearanceConcern = await db.concern.create({
    data: {
      subject: "Graduation clearance follow-up",
      category: "Clearance",
      message:
        "My clearance still shows pending even though I already returned the borrowed equipment last week.",
      status: ConcernStatus.OPEN,
      studentId: student.id,
    },
  });

  await db.auditLog.createMany({
    data: [
      {
        actorId: student.id,
        action: "SEED_CONCERN_CREATED",
        entityType: "Concern",
        entityId: labConcern.id,
        details: { subject: labConcern.subject },
      },
      {
        actorId: coordinator.id,
        action: "SEED_REPLY_CREATED",
        entityType: "ConcernReply",
        entityId: labConcern.id,
        details: { concernSubject: labConcern.subject },
      },
      {
        actorId: student.id,
        action: "SEED_CONCERN_CREATED",
        entityType: "Concern",
        entityId: clearanceConcern.id,
        details: { subject: clearanceConcern.subject },
      },
      {
        actorId: admin.id,
        action: "SEED_ADMIN_READY",
        entityType: "System",
        entityId: null,
        details: { note: "Initial demo content loaded." },
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Demo password:", defaultPassword);
  console.log("Admin email:", adminEmail);
  console.log("Admin password:", adminPassword);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getDb().$disconnect();
  });
