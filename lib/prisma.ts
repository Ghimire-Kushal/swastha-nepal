import { PrismaClient } from '@prisma/client'

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set.')

  const log = process.env.NODE_ENV === 'development'
    ? (['error', 'warn'] as ['error', 'warn'])
    : (['error'] as ['error'])

  // Production: use Neon HTTP driver (required for Vercel edge/serverless)
  // Development: always use standard pg adapter even with a Neon URL
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neon } = require('@neondatabase/serverless')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaNeon } = require('@prisma/adapter-neon')
    // channel_binding is a libpq-only parameter not supported by the Neon HTTP driver
    const neonUrl = url.replace(/[&?]channel_binding=[^&]*/g, '').replace(/\?&/, '?')
    const sql = neon(neonUrl)
    const adapter = new PrismaNeon(sql)
    return new PrismaClient({ adapter, log })
  }

  // Local development — use the pooler URL (DATABASE_URL) so Neon's pgBouncer
  // multiplexes connections; pool size capped to match Neon free-tier limits.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require('@prisma/adapter-pg')
  // Neon free tier supports up to 25 connections via pgBouncer pooler.
  // Keep headroom for migrations and seeds running alongside the app.
  const adapter = new PrismaPg({ connectionString: url, max: 20 })
  return new PrismaClient({ adapter, log })
}

// Prevent multiple PrismaClient instances during HMR in dev
const g = globalThis as unknown as { __prisma?: PrismaClient }
export const prisma: PrismaClient = g.__prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') g.__prisma = prisma
