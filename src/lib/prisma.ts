import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  console.log("Creating Prisma client with env vars:", {
    hasTursoUrl: !!process.env.DATABASE_TURSO_DATABASE_URL,
    hasTursoToken: !!process.env.DATABASE_TURSO_AUTH_TOKEN,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
  });

  // Use Turso adapter in production when env vars are available
  if (
    process.env.DATABASE_TURSO_DATABASE_URL &&
    process.env.DATABASE_TURSO_AUTH_TOKEN
  ) {
    try {
      console.log("Attempting to create Turso adapter...");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaLibSQL } = require("@prisma/adapter-libsql");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createClient } = require("@libsql/client");

      const libsql = createClient({
        url: process.env.DATABASE_TURSO_DATABASE_URL,
        authToken: process.env.DATABASE_TURSO_AUTH_TOKEN,
      });

      const adapter = new PrismaLibSQL(libsql);
      console.log("Turso adapter created successfully");
      return new PrismaClient({
        adapter,
        datasources: {
          db: {
            url: process.env.DATABASE_TURSO_DATABASE_URL,
          },
        },
      });
    } catch (error) {
      console.error("Turso adapter failed, using fallback:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return new PrismaClient();
    }
  }

  console.log("Using local SQLite (no Turso env vars)");
  // Local SQLite for development
  return new PrismaClient();
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient();
}

export const prisma = globalForPrisma.prisma;
