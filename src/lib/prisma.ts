import { PrismaClient } from '@/generated/prisma'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient() {
  // Use Turso in production/Vercel, local SQLite in development
  if (process.env.DATABASE_TURSO_DATABASE_URL && process.env.DATABASE_TURSO_AUTH_TOKEN) {
    const libsql = createClient({
      url: process.env.DATABASE_TURSO_DATABASE_URL,
      authToken: process.env.DATABASE_TURSO_AUTH_TOKEN,
    })

    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter })
  }

  // Fallback to local SQLite for development
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}