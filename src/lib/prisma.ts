import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  if (!globalThis.prismaGlobal) {
    const adapter = new PrismaPg({ connectionString });
    globalThis.prismaGlobal = new PrismaClient({ adapter });
  }

  return globalThis.prismaGlobal;
}
