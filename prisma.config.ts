import { defineConfig } from '@prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // DIRECT_URL bypasses pgBouncer for migrations; falls back to DATABASE_URL for local dev
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
})
