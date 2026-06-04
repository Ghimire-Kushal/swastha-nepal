/**
 * @jest-environment node
 */
// Patients API: GET /api/patients/list — auth guard, role guard, response shape

import { NextRequest } from 'next/server'
import { signToken } from '@/lib/auth'

const TEST_SECRET = 'test-secret-patients-tests-at-least-32-chars!!'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    patient: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'p1', citizenshipNumber: '111-DEMO', user: { name: 'Patient One' } },
        { id: 'p2', citizenshipNumber: '222-DEMO', user: { name: 'Patient Two' } },
      ]),
    },
  },
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}))

import { GET } from '@/app/api/patients/list/route'

beforeAll(() => { process.env.JWT_SECRET = TEST_SECRET })
afterAll(() => { delete process.env.JWT_SECRET })

function makeReq(token?: string): NextRequest {
  const h = new Headers()
  if (token) h.set('Cookie', `auth-token=${token}`)
  return new NextRequest('http://localhost:3000/api/patients/list', { headers: h })
}

describe('GET /api/patients/list', () => {
  it('returns 401 with no token', async () => {
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 403 for patient role', async () => {
    const { cookies } = await import('next/headers')
    const token = await signToken({ sub: 'u1', email: 'p@p.com', name: 'P', role: 'patient' })
    ;(cookies as jest.Mock).mockResolvedValue({ get: jest.fn().mockReturnValue({ value: token }), set: jest.fn() })
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('returns patient list for doctor role', async () => {
    const { cookies } = await import('next/headers')
    const token = await signToken({ sub: 'u1', email: 'd@d.com', name: 'Dr', role: 'doctor' })
    ;(cookies as jest.Mock).mockResolvedValue({ get: jest.fn().mockReturnValue({ value: token }), set: jest.fn() })
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.patients).toHaveLength(2)
    expect(body.patients[0]).toHaveProperty('id')
    expect(body.patients[0]).toHaveProperty('name')
    expect(body.patients[0]).toHaveProperty('citizenshipNumber')
  })

  it('returns patient list for lab_technician role', async () => {
    const { cookies } = await import('next/headers')
    const token = await signToken({ sub: 'u2', email: 'l@l.com', name: 'Lab', role: 'lab_technician' })
    ;(cookies as jest.Mock).mockResolvedValue({ get: jest.fn().mockReturnValue({ value: token }), set: jest.fn() })
    const res = await GET()
    expect(res.status).toBe(200)
  })
})
