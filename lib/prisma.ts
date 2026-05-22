import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set.')
  }
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter, log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] })
}

// Prevent multiple instances of PrismaClient in development (HMR)
const g = globalThis as unknown as { __prisma?: PrismaClient }
export const prisma: PrismaClient = g.__prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') g.__prisma = prisma
