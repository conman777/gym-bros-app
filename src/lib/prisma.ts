import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  return new PrismaClient();
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient();
}

export const prisma = globalForPrisma.prisma;

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
