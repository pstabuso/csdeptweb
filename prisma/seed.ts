import { PrismaPg } from "@prisma/adapter-pg";
import {
  ConcernStatus,
  PrismaClient,
  Role,
  ScheduleEntry,
  UserStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

let db: PrismaClient | null = null;

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for seeding.");
  }

  const adapter = new PrismaPg({ connectionString });
  db = new PrismaClient({ adapter });
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
        studentNumber: "2024-00001",
        passwordHash,
        role: Role.STUDENT,
        status: UserStatus.ACTIVE,
      },
      create: {
        name: "Pat Student",
        email: "student@csdept.edu",
        studentNumber: "2024-00001",
        passwordHash,
        role: Role.STUDENT,
        status: UserStatus.ACTIVE,
      },
    }),
    db.user.upsert({
      where: { email: "coordinator@csdept.edu" },
      update: {
        name: "Casey Coordinator",
        studentNumber: null,
        passwordHash,
        role: Role.COORDINATOR,
        status: UserStatus.ACTIVE,
      },
      create: {
        name: "Casey Coordinator",
        email: "coordinator@csdept.edu",
        studentNumber: null,
        passwordHash,
        role: Role.COORDINATOR,
        status: UserStatus.ACTIVE,
      },
    }),
    db.user.upsert({
      where: { email: "secretary@csdept.edu" },
      update: {
        name: "Sam Secretary",
        studentNumber: null,
        passwordHash,
        role: Role.SECRETARY,
        status: UserStatus.ACTIVE,
      },
      create: {
        name: "Sam Secretary",
        email: "secretary@csdept.edu",
        studentNumber: null,
        passwordHash,
        role: Role.SECRETARY,
        status: UserStatus.ACTIVE,
      },
    }),
    db.user.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
        studentNumber: null,
        passwordHash: adminPasswordHash,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
      create: {
        name: adminName,
        email: adminEmail,
        studentNumber: null,
        passwordHash: adminPasswordHash,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
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
  await db.scheduleEntry.deleteMany();
  await db.auditLog.deleteMany();

  const labConcern = await db.concern.create({
    data: {
      subject: "Request for laboratory make-up schedule",
      category: "Others",
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
      category: "Others",
      message:
        "My clearance still shows pending even though I already returned the borrowed equipment last week.",
      status: ConcernStatus.OPEN,
      studentId: student.id,
    },
  });

  const scheduleEntries: ScheduleEntry[] = await Promise.all([
    db.scheduleEntry.create({
      data: {
        title: "Coordinator consultation hours",
        location: "CS Department Office",
        notes:
          "Walk-in academic consultations are prioritized during this block.",
        startsAt: new Date("2026-05-06T09:00:00+08:00"),
        endsAt: new Date("2026-05-06T11:30:00+08:00"),
        createdById: coordinator.id,
      },
    }),
    db.scheduleEntry.create({
      data: {
        title: "Secretary records processing",
        location: "Records Window",
        notes: "Document requests and follow-up releases are handled here.",
        startsAt: new Date("2026-05-07T13:00:00+08:00"),
        endsAt: new Date("2026-05-07T16:00:00+08:00"),
        createdById: secretary.id,
      },
    }),
  ]);

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
      ...scheduleEntries.map((entry) => ({
        actorId: entry.createdById,
        action: "SEED_SCHEDULE_CREATED",
        entityType: "ScheduleEntry",
        entityId: entry.id,
        details: { title: entry.title },
      })),
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
    await db?.$disconnect();
  });
