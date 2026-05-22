import { PrismaClient } from '@prisma/client'

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set.')

  const log = process.env.NODE_ENV === 'development'
    ? (['error', 'warn'] as ['error', 'warn'])
    : (['error'] as ['error'])

  // Neon serverless driver for production (Vercel edge/serverless)
  // Falls back to standard pg adapter for local development
  if (process.env.NODE_ENV === 'production' || url.includes('neon.tech') || url.includes('supabase.com')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neon } = require('@neondatabase/serverless')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaNeon } = require('@prisma/adapter-neon')
    const sql = neon(url)
    const adapter = new PrismaNeon(sql)
    return new PrismaClient({ adapter, log })
  }

  // Local development — standard pg adapter
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require('@prisma/adapter-pg')
  const adapter = new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter, log })
}

// Prevent multiple PrismaClient instances during HMR in dev
const g = globalThis as unknown as { __prisma?: PrismaClient }
export const prisma: PrismaClient = g.__prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') g.__prisma = prisma
