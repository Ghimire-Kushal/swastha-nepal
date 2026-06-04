/**
 * @jest-environment node
 */
// Lab module: upload lab report, role enforcement, validation

import { signToken } from '@/lib/auth'

const TEST_SECRET = 'test-secret-lab-tests-at-least-32-chars!!!'

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
  }),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    labReport: {
      create: jest.fn().mockResolvedValue({ id: 'lr1' }),
      update: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue({ id: 'lr1', status: 'pending' }),
    },
    auditLog: { create: jest.fn() },
  },
}))

jest.mock('@/lib/audit', () => ({ writeAuditLog: jest.fn() }))

import { uploadLabReport } from '@/app/actions/lab'

beforeAll(() => { process.env.JWT_SECRET = TEST_SECRET })
afterAll(() => { delete process.env.JWT_SECRET })

async function mockCookieWithRole(role: string) {
  const { cookies } = await import('next/headers')
  const token = await signToken({ sub: 'u1', email: 'l@l.com', name: 'Lab', role: role as any })
  ;(cookies as jest.Mock).mockResolvedValue({ get: jest.fn().mockReturnValue({ value: token }), set: jest.fn() })
}

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => fd.append(k, v))
  return fd
}

describe('uploadLabReport server action', () => {
  it('rejects patient role', async () => {
    await mockCookieWithRole('patient')
    const result = await uploadLabReport(undefined, makeFormData({ patientId: 'p1', testName: 'CBC', category: 'hematology', results: 'Normal' }))
    expect(result?.message).toMatch(/unauthorized/i)
  })

  it('rejects doctor role', async () => {
    await mockCookieWithRole('doctor')
    const result = await uploadLabReport(undefined, makeFormData({ patientId: 'p1', testName: 'CBC', category: 'hematology', results: 'Normal' }))
    expect(result?.message).toMatch(/unauthorized/i)
  })

  it('returns validation error for missing test name', async () => {
    await mockCookieWithRole('lab_technician')
    const result = await uploadLabReport(undefined, makeFormData({ patientId: 'p1', testName: '', category: 'hematology', results: 'Normal' }))
    expect(result?.errors).toBeDefined()
  })

  it('accepts valid lab report from lab_technician', async () => {
    await mockCookieWithRole('lab_technician')
    const result = await uploadLabReport(undefined, makeFormData({
      patientId: 'p1',
      testName: 'Complete Blood Count',
      category: 'hematology',
      results: JSON.stringify([{ parameter: 'WBC', value: '7.5', unit: 'k/uL', referenceRange: '4-11', isAbnormal: false }]),
      sampleType: 'Blood',
      notes: 'All values normal',
    }))
    expect(result?.success).toBe(true)
  })
})
