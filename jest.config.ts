import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const baseConfig: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
}

// Wrap createJestConfig so we can override transformIgnorePatterns after
// next/jest sets its defaults (jose is ESM-only and needs to be transformed)
export default async () => {
  const cfg = await createJestConfig(baseConfig)()
  return {
    ...cfg,
    transformIgnorePatterns: ['/node_modules/(?!(jose)/)'],
  }
}
