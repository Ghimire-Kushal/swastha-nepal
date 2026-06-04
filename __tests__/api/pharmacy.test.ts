/**
 * @jest-environment node
 */
// Pharmacy module: dispense prescription, role enforcement

import { signToken } from '@/lib/auth'

const TEST_SECRET = 'test-secret-pharmacy-tests-at-least-32-chars!!'

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
  }),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    prescription: {
      findUnique: jest.fn().mockResolvedValue({ id: 'rx1', status: 'active', patientId: 'p1', doctorId: 'd1', items: [], patient: { user: { name: 'Patient Demo' } } }),
      update: jest.fn().mockResolvedValue({ id: 'rx1', status: 'dispensed' }),
    },
    auditLog: { create: jest.fn() },
  },
}))

jest.mock('@/lib/audit', () => ({ writeAuditLog: jest.fn() }))

import { dispensePrescription } from '@/app/actions/pharmacy'

beforeAll(() => { process.env.JWT_SECRET = TEST_SECRET })
afterAll(() => { delete process.env.JWT_SECRET })

async function mockCookieWithRole(role: string) {
  const { cookies } = await import('next/headers')
  const token = await signToken({ sub: 'u1', email: 'ph@ph.com', name: 'Pharma', role: role as any })
  ;(cookies as jest.Mock).mockResolvedValue({ get: jest.fn().mockReturnValue({ value: token }), set: jest.fn() })
}

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => fd.append(k, v))
  return fd
}

describe('dispensePrescription server action', () => {
  it('rejects patient trying to dispense', async () => {
    await mockCookieWithRole('patient')
    const result = await dispensePrescription(undefined, makeFormData({ prescriptionId: 'rx1' }))
    expect(result?.success).toBe(false)
    expect((result as any)?.error).toMatch(/unauthorized/i)
  })

  it('rejects doctor trying to dispense', async () => {
    await mockCookieWithRole('doctor')
    const result = await dispensePrescription(undefined, makeFormData({ prescriptionId: 'rx1' }))
    expect(result?.success).toBe(false)
  })

  it('allows pharmacist to dispense', async () => {
    await mockCookieWithRole('pharmacist')
    const result = await dispensePrescription(undefined, makeFormData({ prescriptionId: 'rx1', notes: 'Dispensed successfully' }))
    expect(result?.success).toBe(true)
  })
})
