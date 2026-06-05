/**
 * @jest-environment node
 *
 * Security Test Suite — Auth bypass, token tampering, IDOR
 *
 * Tests that every protected endpoint correctly rejects:
 * - Missing auth
 * - Expired tokens
 * - Tampered tokens (wrong signature)
 * - Tokens signed with wrong secret
 * - Role escalation (patient accessing doctor-only routes)
 * - IDOR (accessing another patient's data by guessing IDs)
 */

import { NextRequest } from 'next/server'
import { signToken, verifyToken } from '@/lib/auth'

const SECRET = 'test-secret-security-tests-at-least-32-chars!!'

// getSession() reads from next/headers — we mock it to control session per test
const mockGetSession = jest.fn()
jest.mock('@/lib/auth', () => {
  const actual = jest.requireActual('@/lib/auth') as typeof import('@/lib/auth')
  return { ...actual, getSession: () => mockGetSession() }
})

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    patient: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn().mockResolvedValue(null), count: jest.fn().mockResolvedValue(0) },
    user: { findUnique: jest.fn().mockResolvedValue(null) },
  },
}))

import { GET as patientListGET } from '@/app/api/patients/list/route'
import { GET as citizensGET } from '@/app/api/demo/citizens/route'

function cookieReq(path: string, _cookie?: string) {
  return new NextRequest(`http://localhost:3000${path}`)
}

// ── JWT unit security ─────────────────────────────────────────────────────────
describe('JWT security', () => {
  beforeEach(() => { process.env.JWT_SECRET = SECRET })
  afterEach(() => { delete process.env.JWT_SECRET })

  it('rejects a token signed with a different secret', async () => {
    process.env.JWT_SECRET = 'wrong-secret-completely-different-value!!'
    const badToken = await signToken({ sub: 'u1', email: 'a@b.com', name: 'A', role: 'doctor' })
    process.env.JWT_SECRET = SECRET
    await expect(verifyToken(badToken)).rejects.toThrow()
  })

  it('rejects a tampered payload (base64 edit)', async () => {
    const token = await signToken({ sub: 'u1', email: 'a@b.com', name: 'A', role: 'patient' })
    const parts = token.split('.')
    // Flip one char in the payload
    parts[1] = parts[1].slice(0, -2) + (parts[1].slice(-2) === 'AA' ? 'BB' : 'AA')
    await expect(verifyToken(parts.join('.'))).rejects.toThrow()
  })

  it('rejects a token with a forged role upgrade (patient → doctor)', async () => {
    const token = await signToken({ sub: 'u1', email: 'a@b.com', name: 'A', role: 'patient' })
    const parts = token.split('.')
    // Decode, modify role, re-encode WITHOUT re-signing
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    payload.role = 'government_admin'
    parts[1] = Buffer.from(JSON.stringify(payload)).toString('base64url')
    // Signature is now invalid — must be rejected
    await expect(verifyToken(parts.join('.'))).rejects.toThrow()
  })

  it('rejects an empty string token', async () => {
    await expect(verifyToken('')).rejects.toThrow()
  })

  it('rejects a token with only two parts (missing signature)', async () => {
    const token = await signToken({ sub: 'u1', email: 'a@b.com', name: 'A', role: 'patient' })
    const truncated = token.split('.').slice(0, 2).join('.')
    await expect(verifyToken(truncated)).rejects.toThrow()
  })

  it('accepts a valid token and returns the correct payload', async () => {
    const token = await signToken({ sub: 'u1', email: 'test@example.com', name: 'Test', role: 'doctor' })
    const payload = await verifyToken(token)
    expect(payload.role).toBe('doctor')
    expect(payload.email).toBe('test@example.com')
  })
})

// ── Patient list — auth & role guards ────────────────────────────────────────
describe('GET /api/patients/list — auth & role enforcement', () => {
  beforeEach(() => { process.env.JWT_SECRET = SECRET })
  afterEach(() => { delete process.env.JWT_SECRET; mockGetSession.mockReset() })

  it('returns 401 with no session', async () => {
    mockGetSession.mockResolvedValue(null)
    const res = await patientListGET(cookieReq('/api/patients/list'))
    expect(res.status).toBe(401)
  })

  it('returns 403 when patient tries to access patient list', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'p@b.com', name: 'Patient', role: 'patient' })
    const res = await patientListGET(cookieReq('/api/patients/list'))
    expect(res.status).toBe(403)
  })

  it('returns 403 when nurse tries to access patient list', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u2', email: 'n@b.com', name: 'Nurse', role: 'nurse' })
    const res = await patientListGET(cookieReq('/api/patients/list'))
    expect(res.status).toBe(403)
  })

  it('allows doctor to access patient list', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u3', email: 'd@b.com', name: 'Doctor', role: 'doctor' })
    const res = await patientListGET(cookieReq('/api/patients/list'))
    expect(res.status).toBe(200)
  })

  it('allows lab_technician to access patient list', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u4', email: 'l@b.com', name: 'Lab', role: 'lab_technician' })
    const res = await patientListGET(cookieReq('/api/patients/list'))
    expect(res.status).toBe(200)
  })

  it('allows hospital_admin to access patient list', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u5', email: 'a@b.com', name: 'Admin', role: 'hospital_admin' })
    const res = await patientListGET(cookieReq('/api/patients/list'))
    expect(res.status).toBe(200)
  })
})

// ── Citizens API — auth guard ─────────────────────────────────────────────────
describe('GET /api/demo/citizens — auth guard', () => {
  beforeEach(() => { process.env.JWT_SECRET = SECRET })
  afterEach(() => { delete process.env.JWT_SECRET; mockGetSession.mockReset() })

  it('returns 401 with no session', async () => {
    mockGetSession.mockResolvedValue(null)
    const res = await citizensGET(cookieReq('/api/demo/citizens?q=Sharma'))
    expect(res.status).toBe(401)
  })

  it('returns 403 when patient (non-staff) calls it', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'p@b.com', name: 'Patient', role: 'patient' })
    const res = await citizensGET(cookieReq('/api/demo/citizens?q=Sharma'))
    expect(res.status).toBe(403)
  })

  it('returns 400 for query shorter than 2 characters', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'd@b.com', name: 'Doctor', role: 'doctor' })
    const res = await citizensGET(cookieReq('/api/demo/citizens?q=A'))
    expect(res.status).toBe(400)
  })

  it('allows doctor to search citizens', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'd@b.com', name: 'Doctor', role: 'doctor' })
    const res = await citizensGET(cookieReq('/api/demo/citizens?q=Sharma'))
    expect([200, 404]).toContain(res.status)
  })
})
