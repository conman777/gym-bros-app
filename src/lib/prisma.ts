import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  // Use Turso adapter in production when env vars are available
  if (
    process.env.DATABASE_TURSO_DATABASE_URL &&
    process.env.DATABASE_TURSO_AUTH_TOKEN
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaLibSQL } = require("@prisma/adapter-libsql");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createClient } = require("@libsql/client");

      const libsql = createClient({
        url: process.env.DATABASE_TURSO_DATABASE_URL,
        authToken: process.env.DATABASE_TURSO_AUTH_TOKEN,
      });

      const adapter = new PrismaLibSQL(libsql);
      return new PrismaClient({
        adapter,
        datasourceUrl: process.env.DATABASE_TURSO_DATABASE_URL,
      });
    } catch (error) {
      console.error("Turso adapter failed, using fallback:", error);
      return new PrismaClient();
    }
  }

  // Local SQLite for development
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
