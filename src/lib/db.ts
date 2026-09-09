import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Query logging is dev-only: in production it is noisy, slows every request
// and can leak customer data into platform logs.
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(process.env.NODE_ENV === 'production' ? {} : { log: ['query'] }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
