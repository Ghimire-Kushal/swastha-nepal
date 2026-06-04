/**
 * @jest-environment node
 */
// Auth module: login, register, session, role guards

import { NextRequest } from 'next/server'
import { signToken } from '@/lib/auth'

const TEST_SECRET = 'test-secret-for-auth-tests-at-least-32-chars!!'

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    auditLog: { create: jest.fn() },
  },
}))

jest.mock('@/lib/audit', () => ({ writeAuditLog: jest.fn() }))

import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'
import { signToken as sign, verifyToken } from '@/lib/auth'

beforeAll(() => { process.env.JWT_SECRET = TEST_SECRET })
afterAll(() => { delete process.env.JWT_SECRET })

describe('Password utilities', () => {
  it('hashes and verifies a password correctly', async () => {
    const hash = await hashPassword('MyPass@123')
    expect(await verifyPassword('MyPass@123', hash)).toBe(true)
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })

  it('produces different hashes for the same password', async () => {
    const h1 = await hashPassword('SamePass@1')
    const h2 = await hashPassword('SamePass@1')
    expect(h1).not.toBe(h2)
  })
})

describe('JWT token', () => {
  it('signs and verifies a valid token', async () => {
    const token = await sign({ sub: 'u1', email: 'doc@test.np', name: 'Dr Test', role: 'doctor' })
    const payload = await verifyToken(token)
    expect(payload.sub).toBe('u1')
    expect(payload.role).toBe('doctor')
  })

  it('throws on a tampered token', async () => {
    const token = await sign({ sub: 'u1', email: 'x@y.com', name: 'X', role: 'patient' })
    await expect(verifyToken(token + 'tampered')).rejects.toThrow()
  })

  it('tokens carry the correct role claim', async () => {
    for (const role of ['doctor', 'patient', 'pharmacist', 'lab_technician'] as const) {
      const token = await sign({ sub: 'uid', email: 'a@b.com', name: 'N', role })
      const payload = await verifyToken(token)
      expect(payload.role).toBe(role)
    }
  })
})

describe('findUserByEmail', () => {
  it('returns null for unknown email', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    const { findUserByEmail } = await import('@/lib/db')
    const user = await findUserByEmail('nobody@nowhere.com')
    expect(user).toBeNull()
  })

  it('returns user for known email', async () => {
    const mockUser = { id: 'u1', name: 'Dr Test', email: 'doc@test.np', phone: null, passwordHash: 'hash', role: 'doctor', createdAt: new Date() }
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    const { findUserByEmail } = await import('@/lib/db')
    const user = await findUserByEmail('doc@test.np')
    expect(user?.email).toBe('doc@test.np')
    expect(user?.role).toBe('doctor')
  })
})
